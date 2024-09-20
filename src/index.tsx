import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import * as utils from "./utils";
import { Gesture, GestureDetector, GestureTouchEvent } from "react-native-gesture-handler";
import { IReactNativeJoystickProps } from "./types";
import { ImageBackground } from "react-native";

export const ReactNativeJoystick = ({ onStart, onMove, onStop, color = "#000000", radius = 150, source, style, ...props }: IReactNativeJoystickProps) => {
  const wrapperRadius = radius;
  const nippleRadius = wrapperRadius / 3;

  const [x, setX] = useState(0); // wrapperRadius - nippleRadius
  const [y, setY] = useState(0); // wrapperRadius - nippleRadius

  const handleTouchMove = useCallback(
    (event: GestureTouchEvent) => {
      const e = event.changedTouches[0];
      const fingerX = e.x;
      const fingerY = Platform.OS === 'web' ? (wrapperRadius * 2 - e.y) : e.y;
      let coordinates = {
        x: fingerX - wrapperRadius,
        y: fingerY - wrapperRadius,
      };

      const angle = utils.calcAngle({ x: fingerX, y: fingerY }, { x: wrapperRadius, y: wrapperRadius });

      let dist = utils.calcDistance({ x: wrapperRadius, y: wrapperRadius }, { x: fingerX, y: fingerY });

      const force = dist / (nippleRadius * 2);

      dist = Math.min(dist, wrapperRadius);
      if (dist === wrapperRadius) {
        coordinates = utils.findCoord({ x: wrapperRadius, y: wrapperRadius }, dist, angle);
        coordinates = {
          x: coordinates.x - wrapperRadius,
          y: coordinates.y - wrapperRadius,
        };
      }
      setX(coordinates.x);
      setY(coordinates.y);

      onMove &&
        onMove({
          position: coordinates,
          angle: {
            radian: utils.degreesToRadians(angle),
            degree: angle,
          },
          force,
          type: "move",
        });
    },
    [nippleRadius, wrapperRadius]
  );

  const handleTouchEnd = () => {
    setX(0); // wrapperRadius - nippleRadius
    setY(0); // wrapperRadius - nippleRadius
    onStop &&
      onStop({
        force: 0,
        position: {
          x: 0,
          y: 0,
        },
        angle: {
          radian: 0,
          degree: 0,
        },
        type: "stop",
      });
  };

  const handleTouchStart = () => {
    onStart &&
      onStart({
        force: 0,
        position: {
          x: 0,
          y: 0,
        },
        angle: {
          radian: 0,
          degree: 0,
        },
        type: "start",
      });
  };

  const panGesture = Gesture.Pan().onStart(handleTouchStart).onEnd(handleTouchEnd).onTouchesMove(handleTouchMove);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          width: 2 * radius,
          height: 2 * radius,
          borderRadius: radius,
          //backgroundColor: `${color}55`,
          transform: [{ rotateX: "180deg" }],
          ...(style && typeof style === "object" ? style : {}),
        },
        nipple: {
          height: 2 * nippleRadius,
          width: 2 * nippleRadius,
          borderRadius: nippleRadius,
          //backgroundColor: `${color}bb`,
          position: "absolute",
          transform: [
            {
              translateX: x,
            },
            { translateY: y },
          ],
        },
        imageBackground: {
            width: 5 * nippleRadius,
            height: 5 * nippleRadius,
            position: "absolute",
            transform: [
              {
                translateX: x,
              },
              { translateY: y },
            ],
            zIndex: 10000,
        }
      }),
    [radius, color, nippleRadius, x, y]
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.wrapper} {...props}>
        <ImageBackground source={source} resizeMode="center" style={styles.imageBackground}>
          <View pointerEvents="none" style={styles.nipple}></View>
        </ImageBackground>
      </View>
    </GestureDetector>
  );
};

export type { IReactNativeJoystickEvent, IReactNativeJoystickProps } from "./types";
