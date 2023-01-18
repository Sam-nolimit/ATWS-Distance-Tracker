import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import {
  Dimensions,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { GOOGLE_API_KEY } from "@env";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("screen");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSTION = {
  latitude: 6.5166,
  longitude: 3.38479,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

type InputAutoComplete = {
  label: string;
  placeholder: string;
  onPlaceSelected: (details: GooglePlaceDetail | null) => void;
};

function InputAutoComplete({
  label,
  placeholder,
  onPlaceSelected,
}: InputAutoCompleteProps) {
  return (
    <View style={{ paddingBottom: 1 }}>
      <Text style={{ fontWeight: "400", fontSize: 17, marginBottom: 5 }}>
        {label}
      </Text>
      <GooglePlacesAutocomplete
        styles={{ textInput: styles.input }}
        placeholder={placeholder || ""}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: "pt-BR",
        }}
      />
    </View>
  );
}

export default function App() {
  const [origin, setOrigin] = useState<LatLng | null>();
  const [destination, setDestination] = useState<LatLng | null>();
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  const mapRef = useRef<MapView>(null);

  const moveTo = async (postion: LatLng) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = postion;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const edgePaddingValue = 100;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const traceRouteOnReady = (args: any) => {
    if (args) {
      setDistance(args.distance);
      setDuration(args.distance);
    }
  };

  const traceRoute = () => {
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }
  };

  const onPlaceSelected = (
    details: GooglePlaceDetail | null,
    flag: "origin" | "destination"
  ) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    set(position);
    moveTo(position);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSTION}
      >
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}

        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeWidth={5}
            strokeColor="#260ba9"
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <InputAutoComplete
          label="From"
          onPlaceSelected={(details: GooglePlaceDetail | null) => {
            onPlaceSelected(details, "origin");
          }}
        />
        <InputAutoComplete
          label="To"
          onPlaceSelected={(details: GooglePlaceDetail | null) => {
            onPlaceSelected(details, "destination");
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Track your shipment</Text>
        </TouchableOpacity>
        {distance && duration ? (
          <View>
            <Text style={{ fontWeight: "500", fontSize: 15, marginTop: 10 }}>
              Distance: {distance.toFixed(2)} km
            </Text>
            <Text style={{ fontWeight: "500", fontSize: 15, marginTop: 5 }}>
              Duration: {Math.ceil(duration)} mins
            </Text>
          </View>
        ) : null}
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "transparent",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowColor: "#060606",
    padding: 8,
    borderRadius: 8,
    top: Constants.statusBarHeight + 10,
    alignSelf: "center",
  },
  input: {
    borderColor: "#803030878",
    opacity: 0.9,
    borderWidth: 0.5,
    alignSelf: "center",
    justifyContent: "center",
  },

  button: {
    backgroundColor: "#000000",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
  },
});
