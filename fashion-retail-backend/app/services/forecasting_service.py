#fashion-retail-backend/app/services/forecasting_service.py
import warnings
import os

warnings.filterwarnings('ignore', category=UserWarning, module='lightning')
os.environ['PYTORCH_ENABLE_MPS_FALLBACK'] = '1'

import torch
import pandas as pd
import numpy as np
from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet
from app.config import settings

warnings.filterwarnings('ignore', message='.*InconsistentVersionWarning.*')

class ForecastingService:
    def __init__(self):
        self.model = None
        self.history = None
        self.metadata = None
        self._is_loaded = False
        self.global_min_date = None
    
    def load_model(self):
        print(f"📊 Loading Forecasting Model from {settings.TFT_MODEL_PATH}...")
        if self._try_direct_load(): return
        if self._try_state_dict_load(): return
        print("❌ Failed to load TFT model.")
    
    def _try_direct_load(self) -> bool:
        try:
            self.model = TemporalFusionTransformer.load_from_checkpoint(
                settings.TFT_MODEL_PATH,
                map_location=lambda storage, loc: storage
            )
            self.model.eval()
            self._is_loaded = True
            print("✅ Forecasting Model Loaded (Direct Method)")
            return True
        except Exception:
            return False
    
    def _try_state_dict_load(self) -> bool:
        try:
            print("🔄 Attempting State Dict Load...")
            checkpoint = torch.load(settings.TFT_MODEL_PATH, map_location='cpu')
            self.model = TemporalFusionTransformer(**checkpoint["hyper_parameters"])
            self.model.load_state_dict(checkpoint["state_dict"], strict=False)
            self.model.eval()
            self._is_loaded = True
            print("✅ Forecasting Model Loaded (State Dict Method)")
            return True
        except Exception as e:
            print(f"⚠️ State dict load failed: {e}")
            return False

    def load_data(self, df: pd.DataFrame):
        print("🛠️ Processing Data...")
        try:
            print(f"   - Loading Metadata from {settings.ARTICLES_PATH}...")
            self.metadata = pd.read_csv(settings.ARTICLES_PATH)
            self.metadata['article_id'] = self.metadata['article_id'].astype(str)
            
            df['t_dat'] = pd.to_datetime(df['t_dat'])
            
            if 'sales' not in df.columns:
                print("   - Aggregating raw transactions...")
                self.history = df.groupby(['t_dat', 'article_id']).size().reset_index(name='sales')
            else:
                self.history = df

            self.global_min_date = self.history['t_dat'].min()
            self.history['time_idx'] = (self.history['t_dat'] - self.global_min_date).dt.days
            
            print("   - Calculating Lags & Rolling features...")
            all_dates = pd.date_range(start=self.history['t_dat'].min(), end=self.history['t_dat'].max(), freq='D')
            sales_pivot = self.history.pivot(index='t_dat', columns='article_id', values='sales').reindex(all_dates).fillna(0.0)
            self.history = sales_pivot.stack().reset_index()
            self.history.columns = ['t_dat', 'article_id', 'sales']
            self.history['time_idx'] = (self.history['t_dat'] - self.global_min_date).dt.days
            
            self.history['sales_lag_7'] = self.history.groupby('article_id')['sales'].shift(7).fillna(0.0)
            self.history['sales_lag_28'] = self.history.groupby('article_id')['sales'].shift(28).fillna(0.0)
            self.history['sales_rolling_mean_7'] = self.history.groupby('article_id')['sales'].transform(lambda x: x.rolling(7, min_periods=1).mean()).fillna(0.0)

            cols_to_merge = ['article_id', 'product_type_name', 'product_group_name', 'colour_group_name', 'graphical_appearance_name']
            self.history = self.history.merge(self.metadata[cols_to_merge], on='article_id', how='left')
            
            for col in cols_to_merge[1:]:
                mode_val = self.metadata[col].mode()[0]
                self.history[col] = self.history[col].fillna(mode_val)

            print(f"📦 Data Ready ({len(self.history):,} rows).")
            
        except Exception as e:
            print(f"❌ Error processing data: {e}")

    def is_loaded(self) -> bool:
        return self._is_loaded and self.model is not None

    def predict(self, item_id: str):
        # LAZY LOAD: If model isn't loaded, try to load it now
        if not self.is_loaded():
            print("⚠️ Lazy Loading Forecasting Model...")
            self.load_model()
        if not self.is_loaded() or self.history is None:
            return {"error": "Service not ready"}

        item_data = self.history[self.history['article_id'] == item_id].copy()
        if item_data.empty: return {"error": "Item not found"}

        try:
            max_encoder_length = self.model.dataset_parameters['max_encoder_length']
            encoder_data = item_data.iloc[-max_encoder_length:].copy()
            
            last_time_idx = encoder_data['time_idx'].max()
            prediction_steps = 28
            future_time_idx = np.arange(last_time_idx + 1, last_time_idx + 1 + prediction_steps)
            future_dates = self.global_min_date + pd.to_timedelta(future_time_idx, unit='D')
            
            decoder_data = pd.DataFrame({
                "time_idx": future_time_idx, "t_dat": future_dates, "article_id": item_id,
                "sales": 0.0, "sales_lag_7": 0.0, "sales_rolling_mean_7": 0.0, "sales_lag_28": 0.0
            })
            
            static_cols = ["product_type_name", "product_group_name", "colour_group_name", "graphical_appearance_name"]
            for col in static_cols: decoder_data[col] = encoder_data.iloc[0][col]

            for df_temp in [encoder_data, decoder_data]:
                df_temp['day_of_week'] = df_temp['t_dat'].dt.dayofweek.astype(str)
                df_temp['month'] = df_temp['t_dat'].dt.month.astype(str)
                df_temp['is_weekend'] = df_temp['day_of_week'].isin(['5', '6']).astype(str)

            inference_data = pd.concat([encoder_data, decoder_data], ignore_index=True)

            # --- 🚨 CRITICAL FIX: Use from_parameters instead of from_dataset 🚨 ---
            dataset = TimeSeriesDataSet.from_parameters(
                self.model.dataset_parameters, 
                inference_data, 
                predict=True, 
                stop_randomization=True
            )
            # -----------------------------------------------------------------------
            
            dataloader = dataset.to_dataloader(train=False, batch_size=1, num_workers=0)
            x, _ = next(iter(dataloader))
            
            with torch.no_grad():
                output = self.model(x)
                interpretation = self.model.to_prediction(output)
            
            forecast_values = interpretation[0].detach().numpy().flatten()
            
            forecast_list = [{"date": d.strftime("%Y-%m-%d"), "prediction": max(0.0, float(v))} 
                             for d, v in zip(decoder_data['t_dat'], forecast_values)]
            
            history_list = [{"date": r['t_dat'].strftime("%Y-%m-%d"), "sales": float(r['sales'])} 
                            for _, r in item_data.tail(60).iterrows()]
            
            return {
                "item_id": item_id,
                "details": {k: encoder_data.iloc[0][k] for k in static_cols},
                "history": history_list,
                "forecast": forecast_list
            }

        except Exception as e:
            print(f"❌ Prediction Error: {e}")
            import traceback
            traceback.print_exc()
            return {"error": f"Prediction failed: {str(e)}"}

forecaster = ForecastingService()