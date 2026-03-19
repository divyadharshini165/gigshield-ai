AI-powered parametric insurance platform for Swiggy delivery partners to protect weekly income from weather disruptions.

# GigShield AI

## Theme: AI-Powered Parametric Insurance for Gig Workers

## Problem Statement

Swiggy delivery partners in Chennai often face income loss due to external disruptions such as heavy rain, extreme heat, and high pollution levels. These uncontrollable events reduce their working hours and limit delivery opportunities.

Currently, there is no financial protection system to compensate for this loss of income, making gig workers financially vulnerable.

## Target Persona

Ravi, a 26-year-old Swiggy delivery partner in Chennai, works around 10 hours a day and earns approximately ₹700 per day.

During heavy rain or extreme weather, his working hours reduce significantly, and he may earn only ₹300, leading to a loss of ₹400 per day.

Over a week, this can result in a loss of ₹1000–₹1500, with no financial protection.

## Solution Overview

GigShield AI is an AI-powered parametric insurance platform that protects Swiggy delivery partners from income loss caused by external disruptions.

The system automatically monitors environmental conditions such as weather and pollution. When predefined conditions are met, it triggers an automatic claim and provides instant payout.

This eliminates manual claims and ensures fast and reliable financial support.

The system ensures zero paperwork and fully automated claim settlement using real-time parametric triggers.

## Workflow

1. User registers with location and average income
2. AI calculates weekly premium based on risk factors
3. User subscribes to a weekly insurance plan
4. System monitors environmental conditions continuously
5. If disruption conditions are met, claim is triggered automatically
6. Income loss is calculated and payout is processed instantly
7. Payout is credited directly to the worker’s account via integrated payment system (mock)


## Weekly Pricing Model

The weekly premium is calculated dynamically using risk-based factors.

Formula:
Weekly Premium = (Risk Score × Average Daily Income × Probability Factor) / 100

Example:
Average Daily Income = ₹700  
Risk Score = 0.6  
Probability Factor = 10  

Weekly Premium = ₹42

The premium adjusts weekly based on location risk and predicted disruptions.

## Parametric Triggers

- Heavy Rain: Rainfall greater than 50mm per day
- Extreme Heat: Temperature above 42°C
- Air Pollution: AQI above 300
- Zone Restrictions: Road closures or restricted delivery zones

These triggers enable automatic claim processing without manual intervention.

All triggers are verified using external data sources to ensure transparency and prevent manipulation.

## AI/ML Integration

- Risk prediction using historical weather and location-based data
- Dynamic premium calculation based on predicted disruption probability
- Fraud detection using anomaly detection (e.g., unusual claim frequency, location mismatch)

## Fraud Detection

- GPS-based location validation
- Detection of duplicate claims
- Activity verification using platform data (mock)
- Identification of unusual claim patterns
  
These checks ensure that only genuine income loss claims are processed.

## Tech Stack

Frontend: HTML, CSS, React  
Backend: Node.js / Java  
Database: MySQL  
AI/ML: Python (basic or mock models)  
APIs: Weather API (or mock), Maps API

## Future Enhancements

- Integration with real-time weather and traffic APIs
- Advanced machine learning models for better prediction
- Payment gateway integration for real payouts
- Mobile-first application for delivery workers

## Adversarial Defense & Anti-Spoofing Strategy

### 1. Differentiation

To distinguish between genuine delivery partners and fraudulent users using GPS spoofing, the system uses multi-layer validation instead of relying solely on location data.

The platform compares real-time movement patterns, delivery activity, and environmental consistency. A genuine worker will show natural movement, order activity, and time-based consistency, whereas spoofed users will show static or unrealistic behavior patterns.

---

### 2. Data Signals Used

The system analyzes multiple data points beyond GPS:

- Movement patterns (continuous vs static location)
- Speed and route consistency (realistic delivery paths)
- App activity (order acceptance, delivery logs)
- Time spent in active delivery zones
- Weather consistency (device sensor data vs reported conditions)
- Device-level signals (sudden location jumps, emulator detection - mock)
- Historical behavior patterns of the user

This multi-signal approach helps detect coordinated fraud attempts such as group spoofing.

---

### 3. UX Balance for Honest Users

To ensure genuine users are not unfairly penalized:

- Claims are not immediately rejected but marked as "Under Review"
- Partial payout can be provided while verification is ongoing
- Users receive clear notifications explaining the delay
- Repeated genuine behavior improves trust score and reduces future checks

This ensures a balance between fraud prevention and user trust, maintaining a fair experience for honest delivery partners.

## Conclusion

GigShield AI provides a scalable and automated solution to protect gig workers from unpredictable income loss. By combining AI-driven risk assessment with parametric insurance triggers, the platform ensures fast, transparent, and reliable financial support.
