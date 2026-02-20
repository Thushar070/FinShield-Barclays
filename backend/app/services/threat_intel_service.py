import asyncio
import logging
import random
from datetime import datetime

logger = logging.getLogger("finshield.threat_intel")

class ThreatIntelService:
    def __init__(self):
        self.active_threat_level = "LOW"
        self.global_risk_score = 15.0  # 0 to 100
        self.recent_indicators = []
        self.last_sync = None
        self._sync_task = None
        self.running = False

    async def start_sync_loop(self):
        self.running = True
        logger.info("MOCK: Starting Global Threat Intelligence Sync Loop")
        while self.running:
            await self._fetch_threat_data()
            await asyncio.sleep(60 * 10)  # mock sync every 10 mins

    def stop_sync_loop(self):
        self.running = False

    async def _fetch_threat_data(self):
        # MOCK IMPLEMENTATION: Simulate fetching public feeds (PhishTank, OpenPhish)
        try:
            logger.debug("MOCK: Fetching new threat indicators...")
            # Simulate slight fluctuations in global threat level
            fluctuation = random.uniform(-10, 15)
            self.global_risk_score = max(0, min(100, self.global_risk_score + fluctuation))
            
            if self.global_risk_score > 75:
                self.active_threat_level = "CRITICAL"
            elif self.global_risk_score > 50:
                self.active_threat_level = "HIGH"
            elif self.global_risk_score > 25:
                self.active_threat_level = "MEDIUM"
            else:
                self.active_threat_level = "LOW"

            self.recent_indicators = [
                {"type": "domain", "value": f"secure-login-{random.randint(1000,9999)}.net"},
                {"type": "ip", "value": f"192.168.{random.randint(0,255)}.{random.randint(0,255)}"},
                {"type": "phishing_campaign", "value": "Tax Refund Scam V" + str(random.randint(1,10))}
            ]
            self.last_sync = datetime.utcnow().isoformat()
            logger.info(f"MOCK: Threat Intel synced. Current Level: {self.active_threat_level} ({self.global_risk_score:.1f}%)")
        except Exception as e:
            logger.error(f"Threat intel sync failed: {e}")

    def get_current_threat_status(self):
        return {
            "threat_level": self.active_threat_level,
            "risk_score_global": round(self.global_risk_score, 2),
            "recent_indicators_count": len(self.recent_indicators),
            "last_sync": self.last_sync
        }

threat_intel_engine = ThreatIntelService()
