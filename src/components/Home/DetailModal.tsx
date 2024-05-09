import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Colors } from "@src/constants";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  isShow: boolean;
  onClose: any;
};

const DetailModal = (props: Props) => {
  const { isShow, onClose } = props;
  const ref = React.useRef<BottomSheet>(null);

  const onOpenBottomSheetHandler = (index: number) => {
    ref?.current?.snapToIndex(index);
  };

  useEffect(() => {
    if (isShow === true) {
      onOpenBottomSheetHandler(0);
    } else {
      onOpenBottomSheetHandler(-1);
    }
  }, [isShow]);

  return (
    <>
      <BottomSheet
        ref={ref}
        index={-1}
        enablePanDownToClose={true}
        onClose={onClose}
        snapPoints={[280, "52%", "95%"]}
        style={{
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
          borderRadius: 16,
        }}
      >
        <BottomSheetView>
          <View
            style={{
              paddingHorizontal: 20,
              height: "100%",
              backgroundColor: "white",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            ></View>
            <Text style={styles.title}>Parking lot info</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.primary,
    marginBottom: 8,
    marginTop: 16,
  },
});

export default DetailModal;