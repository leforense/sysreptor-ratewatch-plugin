import logging
from sysreptor.plugins import PluginConfig

log = logging.getLogger(__name__)


class RateWatchPluginConfig(PluginConfig):
    """
    RateWatch — Burp Suite Intruder Rate Limiting Analyzer.

    Upload a Burp Intruder CSV export to visualize rate limiting behavior,
    WAF responses, throttling patterns, and request throughput (RPS).
    """

    plugin_id = '83d78a81-0950-4eef-ae14-d5ebacdf2cb4'

    def ready(self) -> None:
        log.info('Loading RateWatch plugin...')

    def get_frontend_settings(self, request):
        return {}
