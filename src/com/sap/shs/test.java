package com.sap.shs;

/*Class: CIS 27A Assignment 5.2
* Student: Kun Bao
* Date: 2/20/12
* Instructor: Dave Harden
* File name: a6_1.java
*
* This program utilizes System.out.println() to prompt the user to enter
* three integers for height, width, and stages of a rocket which are passed to
* a method called "drawRocket" to draw the rocket.
* The user inputs are stored in the variables height, width, and totalStage using the Scanner object 'input'.
* The drawRocket has three methods to draw the cones and stages of the rocket called "drawCone" and "drawBox".
* "drawCone" method can determine if the width is odd or even number and call drawConeOddWidth method or drawConeEvenWidth method accordingly.
* "drawBox" method will call drawHorizontalLine to make the horizontal lines and call draw2VerticalLines to make vertical lines.  *
* The results are then displayed, utilizing System.out.println() again.
 */

public class test {

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            int big = (int) (Math.random() * 10000);
            int small = (int) (Math.random() * 10000);
            int temp = big;
            if (big < small) {
                big = small;
                small = temp;
            }
            System.out.println(big + " - " + small + " = ");
        }

    }
}

