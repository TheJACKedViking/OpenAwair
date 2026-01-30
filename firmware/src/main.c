#include "firmware_config.h"

int main(void) {
  openawair_device_config_t config = {
      .model = OPENAWAIR_MODEL_GLOW_C,
      .device_id = "awair-glowc-01",
  };

  (void)config;
  while (1) {
  }
  return 0;
}
