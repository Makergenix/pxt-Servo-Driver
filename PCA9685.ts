
/**
* makecode Servo Driver micro:bit
* From Makergenix
* http://www.micropython.org.cn
*/

enum channels {
        //% block="Ch0"
        C0 = 0,
        //% block="Ch1"
        C1 = 1,
        //% block="Ch2"
        C2 = 2,
        //% block="Ch3"
        C3 = 3,
        //% block="Ch4"
        C4 = 4,
        //% block="Ch5"
        C5 = 5,
        //% block="Ch6"
        C6 = 6,
        //% block="Ch7"
        C7 = 7,
        //% block="Ch8"
        C8 = 8,
        //% block="Ch9"
        C9 = 9,
        //% block="Ch10"
        C10 = 10,
        //% block="Ch11"
        C11 = 11,
        //% block="Ch12"
        C12 = 12,
        //% block="Ch13"
        C13 = 13,
        //% block="Ch14"
        C14 = 14,
        //% block="Ch15 "
        C15 = 15
}

enum OnOff {
    Off = 0,
    On = 1
}

/**
 * Custom Blocks
 */
//% weight=4 color=#0fbc11 icon="P" block="PCA9685"
namespace PCA9685 {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07

    let initialized = false

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        // setPwm(0, 0, 4095);
        for (let ch = 0; ch < 16; ch++) {
            setPwm(ch, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

	/**
	 * Servo Execute
	 * @param degree [0-180] degree of servo; eg: 90, 0, 180
	*/

    //% blockId=Servo_Degree weight=80 blockGap=20
    //% block="Rotate servo at Channel %channel | to %degree | degrees"
    //% degree.min=0 degree.max=180
    export function Servo(channel: channels, degree: number): void {
		if (!initialized) {
            initPCA9685();
        }
		// 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600); // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000;
        setPwm(channel, 0, value);
    }
	
	/**
	 * Servo Execute
	 * @param pulse [500-2500] pulse of servo; eg: 1500, 500, 2500
	*/
    //% blockId=setServoPulse block="Set %channel | at pulse %pulse"
    //% weight=90
    //% pulse.min=500 pulse.max=2500
    export function PWMPulse(channel: channels, pulse: number): void {
		if (!initialized) {
            initPCA9685();
        }
		// 50hz: 20,000 us
        let value = pulse * 4096 / 20000;
        setPwm(channel, 0, value);
    }

    /**
     * Turn LED on or off.
     * @param state boolen 0 or 1;
    */

    //% blockId=Led weight=100
    //% block="LED at %channel | %state"
    export function led(channel: channels, state: OnOff): void {
        if (!initialized) {
            initPCA9685();
        }
        if (state==1) {
            setPwm(channel, 0, 2500);
        } else {
            setPwm(channel, 0, 0);
        }
    }
}