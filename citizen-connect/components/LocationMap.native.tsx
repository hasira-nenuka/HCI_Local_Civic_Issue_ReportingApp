import React from "react";
import MapView, { Marker } from "react-native-maps";
export default function LocationMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange?: (latitude: number, longitude: number) => void;
}) {
  return (
    <MapView
      style={{ width: "100%", height: 240, borderRadius: 12 }}
      region={{
        latitude,
        longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }}
      onPress={(e) =>
        onChange?.(
          e.nativeEvent.coordinate.latitude,
          e.nativeEvent.coordinate.longitude,
        )
      }
    >
      <Marker
        coordinate={{ latitude, longitude }}
        draggable={!!onChange}
        onDragEnd={(e) =>
          onChange?.(
            e.nativeEvent.coordinate.latitude,
            e.nativeEvent.coordinate.longitude,
          )
        }
      />
    </MapView>
  );
}
