import math
from typing import Optional, List

# Configuration des barèmes (identique à scoring.ts)
SCORING = {
    "zoom": {
        "stage_points": [100, 80, 60, 40, 20],  #
        "wrong_penalty": 10,  #
    },
    "connections": {
        "time_bonus_max": 20,  #[cite: 1]
        "time_limit_sec": 120,  #[cite: 1]
        "mistake_penalty": 5,  #[cite: 1]
        "denominator": 100,  #[cite: 1]
    },
    "timeline": {
        "base_max": 80,  #[cite: 1]
        "time_bonus_max": 20,  #[cite: 1]
        "time_limit_sec": 120,  #[cite: 1]
    },
}

def clamp(val: float, min_val: int = 0, max_val: int = 100) -> int:
    return max(min_val, min(max_val, round(val)))

# --- ZOOM ---
def calculate_zoom_score(answered_stage: Optional[int], wrong_guesses: int) -> int:
    if answered_stage is None:
        return 0
    stage_points = SCORING["zoom"]["stage_points"]
    wrong_penalty = SCORING["zoom"]["wrong_penalty"]
    
    base_points = stage_points[answered_stage] if 0 <= answered_stage < len(stage_points) else 0
    return max(0, base_points - (wrong_guesses * wrong_penalty))

# --- CONNEXIONS ---
def calculate_connections_score(
    found_group_points: int, mistakes: int, time_left_sec: float, all_found: bool
) -> int:
    c = SCORING["connections"]
    bonus = (
        c["time_bonus_max"] * (max(0.0, time_left_sec) / c["time_limit_sec"])
        if all_found
        else 0.0
    )
    raw = found_group_points - (c["mistake_penalty"] * mistakes) + bonus
    return clamp((raw / c["denominator"]) * 100)

# --- TIMELINE ---
def pairs_accuracy(player_order_years: List[int]) -> float:
    good = 0
    total = 0
    n = len(player_order_years)
    for i in range(n):
        for j in range(i + 1, n):
            total += 1
            if player_order_years[i] < player_order_years[j]:
                good += 1
    return 0.0 if total == 0 else good / total

def calculate_timeline_score(player_order_years: List[int], time_left_sec: float) -> int:
    t = SCORING["timeline"]
    accuracy = pairs_accuracy(player_order_years)
    base = t["base_max"] * accuracy
    bonus = t["time_bonus_max"] * (max(0.0, time_left_sec) / t["time_limit_sec"]) * accuracy
    return clamp(base + bonus)