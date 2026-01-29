#ifndef OPENAWAIR_FIRMWARE_CONFIG_H
#define OPENAWAIR_FIRMWARE_CONFIG_H

#define OPENAWAIR_MODEL_GLOW_C 1
#define OPENAWAIR_MODEL_ELEMENT 2

typedef struct {
  unsigned int model;
  const char *device_id;
} openawair_device_config_t;

#endif
