import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

print("Generating synthetic traffic training data...")
# Features: [hour_of_day (0-23), day_of_week (0-6), weather_condition (0=Clear, 1=Rain, 2=Storm)]
# Target: Traffic Volume (0-100)

X = []
y = []

for _ in range(5000):
    hour = np.random.randint(0, 24)
    day = np.random.randint(0, 7)
    weather = np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1])
    
    # Base traffic based on hour
    if 7 <= hour <= 9: # Morning rush
        volume = 80 + np.random.normal(0, 5)
    elif 17 <= hour <= 19: # Evening rush
        volume = 90 + np.random.normal(0, 5)
    elif 1 <= hour <= 5: # Night
        volume = 15 + np.random.normal(0, 3)
    else: # Midday
        volume = 50 + np.random.normal(0, 10)
        
    # Weekend reduction
    if day >= 5: 
        volume *= 0.7
        
    # Weather impact
    if weather == 1: volume += 15
    if weather == 2: volume += 30
    
    volume = max(0, min(100, volume))
    
    X.append([hour, day, weather])
    y.append(volume)

X = np.array(X)
y = np.array(y)

print("Training scikit-learn Random Forest Regressor...")
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X, y)

print(f"Model trained! R^2 Score on training data: {model.score(X, y):.3f}")

# Save the model
model_path = os.path.join(os.path.dirname(__file__), 'traffic_rf_model.pkl')
joblib.dump(model, model_path)
print(f"Model successfully saved to {model_path}")
