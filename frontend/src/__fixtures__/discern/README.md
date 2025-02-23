# Discern API Test Fixtures

This directory contains test fixtures for the discernment API endpoint, each designed to test different aspects of topic tracking and claim extraction.

## Test Cases

### 1. space-exploration.json
Tests initial topic and summary generation:
- Empty initial state (no summary or topic)
- Should generate both summary and topic about NASA's Artemis program
- Contains specific claims about budget, timeline, and partnerships

### 2. kendrick-sza-collab.json
Tests natural topic progression:
- Initial context: Kendrick's Super Bowl performance
- New context: Kendrick and SZA's collaboration history
- Should identify specific claims about their songs and professional relationship
- Tests how well the model maintains context while recognizing new focus

### 3. love-is-blind-representation.json
Tests clear topic shift within same show:
- Initial context: Minneapolis season being boring
- New context: Black representation in past seasons
- Should extract claims about Clay and Bretton's experiences
- Tests how model handles shift from location-specific discussion to broader thematic analysis

## Usage

These fixtures can be used to test:
1. Topic transition detection
2. Claim extraction accuracy
3. Context maintenance
4. Summary updates

Example curl request:
```bash
curl -X POST http://localhost:3000/api/discern \
  -H "Content-Type: application/json" \
  -d @space-exploration.json
```
