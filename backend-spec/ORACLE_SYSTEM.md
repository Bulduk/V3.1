# Predix Oracle System Architecture

This document outlines the architecture for the Predix Oracle System, ensuring accurate, secure, and fair market resolution.

## 🏗️ System Design

The Oracle System is composed of four main layers:

1. **Data Sources:** Multiple APIs (TikTok, YouTube), scraper fleets, and aggregated inputs.
2. **Aggregation Layer:** Combines data from multiple sources using weighted averages based on trust levels.
3. **Validation Layer:** Detects anomalies, requires multiple confirmations, and delays resolution if necessary.
4. **Decision Engine:** Determines the final outcome based on YES/NO, RANGE, or DIRECTION logic.

## ⚙️ Resolution Flow

`PENDING` → `VERIFYING` → `RESOLVED` (or `DISPUTED`)

1. **PENDING:** The market has ended, and the system is waiting for data.
2. **VERIFYING:** Data is being aggregated and validated.
3. **RESOLVED:** The decision engine has determined the outcome, and payouts are processed.
4. **DISPUTED:** An anomaly was detected, or human review is required.

## 🔐 Security & Reliability

- **Never rely on a single data source.**
- **Accuracy > Speed:** It is better to delay resolution than to resolve incorrectly.
- **Anomaly Detection:** Sudden spikes or conflicting data sources trigger a circuit breaker (moving the market to `DISPUTED`).
- **Human Override:** Admins can review disputed markets and manually resolve them.

## 📁 Code Structure

- `oracle-scheduler.service.ts`: Automated cron job (runs every 5 minutes) that orchestrates the pipeline (aggregates, validates, and triggers resolution if the market has ended).
- `oracle-aggregation.service.ts`: Fetches snapshots and calculates a weighted average and confidence score.
- `oracle-validation.service.ts`: Checks for anomalies (e.g., low confidence, abnormal spikes).
- `oracle-decision.service.ts`: Uses validated data to determine the final outcome and trigger on-chain execution.
