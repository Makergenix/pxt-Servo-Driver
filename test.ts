// tests go here; this will not be compiled when this package is used as a library

//Rotate Motor(Channel 0) at 180 deg
PCA9685.Servo(channels.Channel_1, 180)

//Generate PWM at channel 2
PCA9685.PWMPulse(channels.Channel_2, 500)

//Turn On LED at Channel 1
PCA9685.led(channels.Channel_1, OnOff.On)

//Turn Off LED at Channel 1
PCA9685.led(channels.Channel_1, OnOff.Off)