import os

from .region_composer_node import PCTextEncode_RegionComposer

WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")

NODE_CLASS_MAPPINGS = {
    "PCTextEncode_RegionComposer": PCTextEncode_RegionComposer,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PCTextEncode_RegionComposer": "PC Region Composer",
}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
