/**
 * Functions are mapped to blocks using various macros
 * in comments starting with %. The most important macro
 * is "block", and it specifies that a block should be
 * generated for an **exported** function.
 */

let Sensor_All_PIN = [0, 1, 2, 3, 4, 5]
let Sensor_PIN = [1, 2, 3, 4]
let Sensor_Left = [0]
let Sensor_Right = [5]
let Num_Sensor = 4
let LED_PIN = 0

let Servo_Version = 1
let ADC_Version = 1
let Read_Servo_Version = false
let Read_ADC_Version = false
let PCA = 0x40
let initI2C = false
let initLED = false
let SERVOS = 0x06
let Line_LOW = [0, 0, 0, 0, 0, 0, 0, 0]
let Line_HIGH = [0, 0, 0, 0, 0, 0, 0, 0]
let Color_Line_All: number[] = []
let Color_Background_All: number[] = []
let Color_Line: number[] = []
let Color_Background: number[] = []
let Color_Line_Left: number[] = []
let Color_Background_Left: number[] = []
let Color_Line_Right: number[] = []
let Color_Background_Right: number[] = []
let Line_All = [0, 0, 0, 0, 0, 0]
let Line_Mode = 0
let Last_Position = 0
let Compensate_Left = 0
let Compensate_Right = 0
let error = 0
let P = 0
let D = 0
let previous_error = 0
let PD_Value = 0
let left_motor_speed = 0
let right_motor_speed = 0
let Servo_8_Enable = 0
let Servo_12_Enable = 0
let Servo_8_Degree = 0
let Servo_12_Degree = 0
let distance = 0
let timer = 0

enum Motor_Write {
    //% block="Left"
    Motor_Left,
    //% block="Right"
    Motor_Right
}

enum _Turn {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum _Spin {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum Servo_Write {
    //% block="P8"
    P8,
    //% block="P12"
    P12
}

enum Button_Status {
    //% block="Pressed"
    Pressed,
    //% block="Released"
    Released
}

enum ADC_Read {
    //% block="6"
    ADC6 = 0xB4,
    //% block="7"
    ADC7 = 0xF4
}

enum Forward_Direction {
    //% block="Forward"
    Forward,
    //% block="Backward"
    Backward
}

enum Find_Line {
    //% block="Left"
    Left,
    //% block="Center"
    Center,
    //% block="Right"
    Right
}

enum Turn_Line {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum Turn_Sensor {
    //% block="Center"
    Center,
    //% block="ADC1"
    ADC1,
    //% block="ADC2"
    ADC2,
    //% block="ADC3"
    ADC3,
    //% block="ADC4"
    ADC4
}

enum Turn_ADC {
    //% block="ADC0"
    ADC0 = 0,
    //% block="ADC1"
    ADC1 = 1,
    //% block="ADC2"
    ADC2 = 2,
    //% block="ADC3"
    ADC3 = 3,
    //% block="ADC4"
    ADC4 = 4,
    //% block="ADC5"
    ADC5 = 5
}

enum NeoPixelColors {
    //% block=Red
    Red = 0xFF0000,
    //% block=Green
    Green = 0x00FF00,
    //% block=Blue
    Blue = 0x0000FF,
    //% block=Orange
    Orange = 0xFFA500,
    //% block=Yellow
    Yellow = 0xFFFF00,
    //% block=Indigo
    Indigo = 0x4b0082,
    //% block=Violet
    Violet = 0x8a2be2,
    //% block=Purple
    Purple = 0xFF00FF,
    //% block=White
    White = 0xFFFFFF,
    //% block=Black
    Black = 0x000000
}

enum NeoPixelMode {
    //% block="RGB (GRB format)"
    RGB = 1,
    //% block="RGB+W"
    RGBW = 2,
    //% block="RGB (RGB format)"
    RGB_RGB = 3
}

enum LED_Color {
    //% block=Red
    Red = 0xFF0000,
    //% block=Green
    Green = 0x00FF00,
    //% block=Blue
    Blue = 0x0000FF,
    //% block=White
    White = 0xFFFFFF,
    //% block=Black
    Black = 0x000000
}

//% color="#51cb57" icon="\u2B99"
namespace PTKidsBITRobot {
    function initPCA(): void {
        let i2cData = pins.createBuffer(2)
        initI2C = true
        i2cData[0] = 0
        i2cData[1] = 0x10
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = 0xFE
        i2cData[1] = 101
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = 0
        i2cData[1] = 0x81
        pins.i2cWriteBuffer(PCA, i2cData, false)

        for (let servo = 0; servo < 16; servo++) {
            i2cData[0] = SERVOS + servo * 4 + 0
            i2cData[1] = 0x00

            i2cData[0] = SERVOS + servo * 4 + 1
            i2cData[1] = 0x00
            pins.i2cWriteBuffer(PCA, i2cData, false);
        }
    }

    function setServoPCA(servo: number, angle: number): void {
        if (initI2C == false) {
            initPCA()
        }
        let i2cData = pins.createBuffer(2)
        let start = 0
        let angle_input = pins.map(angle, 0, 180, -90, 90)
        angle = Math.max(Math.min(90, angle_input), -90)
        let stop = 369 + angle * 235 / 90
        i2cData[0] = SERVOS + servo * 4 + 2
        i2cData[1] = (stop & 0xff)
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = SERVOS + servo * 4 + 3
        i2cData[1] = (stop >> 8)
        pins.i2cWriteBuffer(PCA, i2cData, false)
    }

    //% group="Motor Control"
    /**
     * Stop all Motor
     */
    //% block="Motor Stop"
    export function motorStop(): void {
        pins.digitalWritePin(DigitalPin.P13, 1)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.digitalWritePin(DigitalPin.P15, 1)
        pins.analogWritePin(AnalogPin.P16, 0)
    }

    // //% group="Motor Control"
    // /**
    //  * Compensate Speed Motor Left and Motor Right
    //  */
    // //% block="Compensate Left %Motor_Left|Compensate Right %Motor_Right"
    // //% left.min=-100 left.max=100
    // //% right.min=-100 right.max=100
    // export function motorCompensate(left: number, right: number): void {
    //     Compensate_Left = left
    //     Compensate_Right = right
    // }

    //% group="Motor Control"
    /**
     * Spin the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    //% block="Spin %_Spin|Speed %Speed"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function Spin(spin: _Spin, speed: number): void {
        if (spin == _Spin.Left) {
            motorGo(-speed, speed)
        }
        else if (spin == _Spin.Right) {
            motorGo(speed, -speed)
        }
    }

    //% group="Motor Control"
    /**
     * Turn the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    //% block="Turn %_Turn|Speed %Speed"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function Turn(turn: _Turn, speed: number): void {
        if (turn == _Turn.Left) {
            motorGo(0, speed)
        }
        else if (turn == _Turn.Right) {
            motorGo(speed, 0)
        }
    }

    //% group="Motor Control"
    /**
     * Control motors speed both at the same time. The speed motors is adjustable between -100 to 100.
     */
    //% block="Motor Left %Motor_Left|Motor Right %Motor_Right"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% speed1.defl=50
    //% speed2.defl=50
    export function motorGo(speed1: number, speed2: number): void {
        speed1 = speed1 + Compensate_Left
        speed2 = speed2 + Compensate_Right

        if (speed1 < -100) {
            speed1 = -100
        }
        else if (speed1 > 100) {
            speed1 = 100
        }
        if (speed2 < -100) {
            speed2 = -100
        }
        else if (speed2 > 100) {
            speed2 = 100
        }

        speed1 = pins.map(speed1, -100, 100, -1023, 1023)
        speed2 = pins.map(speed2, -100, 100, -1023, 1023)

        if (speed1 < 0) {
            pins.digitalWritePin(DigitalPin.P13, 1)
            pins.analogWritePin(AnalogPin.P14, -speed1)
            pins.analogSetPeriod(AnalogPin.P14, 2000)
        }
        else if (speed1 >= 0) {
            pins.digitalWritePin(DigitalPin.P13, 0)
            pins.analogWritePin(AnalogPin.P14, speed1)
            pins.analogSetPeriod(AnalogPin.P14, 2000)
        }

        if (speed2 < 0) {
            pins.digitalWritePin(DigitalPin.P15, 1)
            pins.analogWritePin(AnalogPin.P16, -speed2)
            pins.analogSetPeriod(AnalogPin.P16, 2000)
        }
        else if (speed2 >= 0) {
            pins.digitalWritePin(DigitalPin.P15, 0)
            pins.analogWritePin(AnalogPin.P16, speed2)
            pins.analogSetPeriod(AnalogPin.P16, 2000)
        }
    }

    //% group="Motor Control"
    /**
     * Control motor speed 1 channel. The speed motor is adjustable between -100 to 100.
     */
    //% block="motorWrite %Motor_Write|Speed %Speed"
    //% speed.min=-100 speed.max=100
    //% speed.defl=50
    export function motorWrite(motor: Motor_Write, speed: number): void {
        if (motor == Motor_Write.Motor_Left) {
            motorGo(speed, 0)
        }
        else if (motor == Motor_Write.Motor_Right) {
            motorGo(0, speed)
        }
    }

    //% group="Servo Control"
    /**
     * Control Servo Motor 0 - 180 Degrees
     */
    //% block="Servo %Servo_Write|Degree %Degree"
    //% degree.min=0 degree.max=180
    export function servoWrite(servo: Servo_Write, degree: number): void {
        if (Read_Servo_Version == false) {
            let i2cData = pins.createBuffer(2)
            i2cData[0] = 0
            i2cData[1] = 16
            if (pins.i2cWriteBuffer(64, i2cData, false) == 0) {
                Servo_Version = 2
            }
            else {
                Servo_Version = 1
            }
            Read_Servo_Version = true
        }
        if (servo == Servo_Write.P8) {
            if (Servo_Version == 1) {
                Servo_8_Enable = 1
                Servo_8_Degree = degree
                pins.servoWritePin(AnalogPin.P8, Servo_8_Degree)
                pins.servoWritePin(AnalogPin.P12, Servo_12_Degree)
                basic.pause(100)
            }
            else {
                setServoPCA(1, degree)
            }
        }
        else if (servo == Servo_Write.P12) {
            if (Servo_Version == 1) {
                Servo_12_Enable = 1
                Servo_12_Degree = degree
                pins.servoWritePin(AnalogPin.P8, Servo_8_Degree)
                pins.servoWritePin(AnalogPin.P12, Servo_12_Degree)
                basic.pause(100)
            }
            else {
                setServoPCA(0, degree)
            }
        }
    }

    //% group="Sensor and ADC"
    /**
     * Read Analog from ADC Channel
     */
    //% block="ADCRead %ADC_Read"
    export function ADCRead(ADCRead: ADC_Read): number {
        if (Read_ADC_Version == false) {
            let i2cData = pins.createBuffer(1)
            i2cData[0] = 132
            if (pins.i2cWriteBuffer(0x49, i2cData, false) == 0) {
                ADC_Version = 2
            }
            else {
                ADC_Version = 1
            }
            Read_ADC_Version = true
        }

        if (ADC_Version == 1) {
            pins.i2cWriteNumber(0x48, ADCRead, NumberFormat.UInt8LE, false)
            return ADCRead = pins.i2cReadNumber(0x48, NumberFormat.UInt16BE, false)
        }
        else if (ADC_Version == 2) {
            pins.i2cWriteNumber(0x49, ADCRead, NumberFormat.UInt8LE, false)
            return ADCRead = pins.i2cReadNumber(0x49, NumberFormat.UInt8LE, false)
        }
        else {
            return 0
        }
    }

    //% group="Sensor and ADC"
    /**
     * Read Distance from Ultrasonic Sensor
     */
    //% block="GETDistance"
    export function distanceRead(): number {
        let duration

        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P1, 0)
        if (pins.digitalReadPin(DigitalPin.P2) == 0) {
            pins.digitalWritePin(DigitalPin.P1, 0)
            pins.digitalWritePin(DigitalPin.P1, 1)
            pins.digitalWritePin(DigitalPin.P1, 0)
            duration = pins.pulseIn(DigitalPin.P2, PulseValue.High, 500 * 58)
        } else {
            pins.digitalWritePin(DigitalPin.P1, 0)
            pins.digitalWritePin(DigitalPin.P1, 1)
            duration = pins.pulseIn(DigitalPin.P2, PulseValue.Low, 500 * 58)
        }

        let x = duration / 39

        if (x <= 0 || x > 400) {
            return 400
        }

        return Math.round(x)
    }
}