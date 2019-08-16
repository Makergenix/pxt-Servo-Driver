from microbit import *

PCA9685_ADDRESS = 0x40
MODE1 = 0x00
MODE2 = 0x01
PRESCALE = 0xFE
LED0_ON_L = 0x06
LED0_ON_H = 0x07

#  Useless
SUBADR1 = 0x02
SUBADR2 = 0x03
SUBADR3 = 0x04
PRESCALE = 0xFE
LED0_OFF_L = 0x08
LED0_OFF_H = 0x09
ALL_LED_ON_L = 0xFA
ALL_LED_ON_H = 0xFB
ALL_LED_OFF_L = 0xFC
ALL_LED_OFF_H = 0xFD

STP_CHA_L = 2047
STP_CHA_H = 4095

STP_CHB_L = 1
STP_CHB_H = 2047

STP_CHC_L = 1023
STP_CHC_H = 3071

STP_CHD_L = 3071
STP_CHD_H = 1023
##  END  ##

class servo_driver():
    def __init__(self):
        i2c.init(freq=100000, sda=pin20, scl=pin19)
        self.write_i2c(PCA9685_ADDRESS, MODE1, 0x00)
        self.set_freq(50)

    def read_i2c(self, addr, value):
        i2c.write(addr, bytearray(value), repeat=False)
        return i2c.read(addr, 2, repeat=False)

    def write_i2c(self, addr, reg, value):
        buf = bytearray(2)
        buf[0] = int(reg)
        buf[1] = int(value)
        i2c.write(addr, buf, repeat=False)

    def set_freq(self, freq):
        prescale_val = 25000000
        prescale_val /= 4096
        prescale_val /= freq
        prescale_val -= 1
        prescale = prescale_val #Math.Floor(prescaleval + 0.5)
        oldmode = int(self.read_i2c(PCA9685_ADDRESS, MODE1)[0])
        newmode = (oldmode & 0x7F) | 0x10 # sleep
        self.write_i2c(PCA9685_ADDRESS, MODE1, newmode) # go to sleep
        self.write_i2c(PCA9685_ADDRESS, PRESCALE, prescale) # set the prescaler
        self.write_i2c(PCA9685_ADDRESS, MODE1, oldmode)
        sleep(5)
        self.write_i2c(PCA9685_ADDRESS, MODE1, oldmode | 0xa1)

    def set_pwm(self, channel, off):
        on = 0
        off = int(off)
        buf = bytearray(5)
        buf[0] = LED0_ON_L + 4 * channel
        buf[1] = on & 0xff
        buf[2] = (on >> 8) & 0xff
        buf[3] = off & 0xff
        buf[4] = (off >> 8) & 0xff
        i2c.write(PCA9685_ADDRESS, buf, repeat=False)

    def servo_rotate(self, channel, degree):
        # 50hz: 20,000 us
        value = (degree * 1800 / 180 + 600) # 0.6 ~ 2.4
        value *= 4096 / 20000
        self.set_pwm(channel, value)

    def servo_pulse(self, channel, pulse):
    # 50hz: 20,000 us
        value = pulse * 4096 / 20000
        self.set_pwm(channel, value)

    def LED(self, channel, status):
        if status:
            self.set_pwm(channel, 2500)
        else:
            self.set_pwm(channel, 0)

s = servo_driver()
ch = 1
while True:
    #s.servo_pulse(ch, 2500)
    s.servo_pulse(ch, 2500)
    sleep(1000)
    s.servo_pulse(ch, 500)
    #s.servo_rotate(ch, 180)
    sleep(1000)