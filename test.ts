input.onButtonPressed(Button.A, function () {
    PTKidsBITRobot.motorGo(100, 100)
    basic.pause(500)
    PTKidsBITRobot.motorGo(-100, -100)
    basic.pause(500)
    PTKidsBITRobot.motorStop()
})
input.onButtonPressed(Button.B, function () {
    PTKidsBITRobot.servoWrite(Servo_Write.P8, 0)
    PTKidsBITRobot.servoWrite(Servo_Write.P12, 0)
    basic.pause(500)
    PTKidsBITRobot.servoWrite(Servo_Write.P8, 90)
    PTKidsBITRobot.servoWrite(Servo_Write.P12, 90)
})
music.playTone(988, music.beat(BeatFraction.Whole))
basic.forever(function () {
    serial.writeString("" + (PTKidsBITRobot.ADCRead(ADC_Read.ADC6)))
    serial.writeString(" ")
    serial.writeString("" + (PTKidsBITRobot.ADCRead(ADC_Read.ADC7)))
    serial.writeString(" | ")
    serial.writeString("" + (PTKidsBITRobot.distanceRead()))
    serial.writeLine("")
    basic.pause(50)
})