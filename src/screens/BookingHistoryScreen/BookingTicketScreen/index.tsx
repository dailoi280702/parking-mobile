import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Spinner } from "@nghinv/react-native-loading";
import { ticketApi } from "@src/api";
import AppQRCode from "@src/components/Booking/QRCode";
import SelectableReviewItem from "@src/components/Booking/SelectableReviewItem";
import AppButton from "@src/components/common/AppButton";
import { Colors } from "@src/constants";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { selectUser } from "@src/store/selectors";
import { ticketActions } from "@src/store/slices/ticketSlice";
import { DateTimeHelper } from "@src/utils";
import {
  CANCEL_STATE,
  COMPLETED_STATE,
  ONGOING_STATE,
} from "@src/utils/constant";
import dayjs from "dayjs";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableOpacityBase,
  View,
} from "react-native";
import {
  ClipboardDocumentListIcon,
  TrashIcon,
} from "react-native-heroicons/outline";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

const Item = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color?: string;
}) => {
  return (
    <View style={styles.flex}>
      <Text style={[styles.title, { color: color }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

const BookingTicketScreen = ({ navigation, route }: any) => {
  const ref = useRef(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const userState = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [ticketWithExtend, setTicketWithExtend] = useState<Ticket>(
    route.params
  );
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [review, setReview] = useState("");
  const [isGoodReview, setIsGoodReview] = useState(true);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef?.current?.snapToIndex(0);
    } else {
      bottomSheetRef?.current?.snapToIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      ticketWithExtend.state == COMPLETED_STATE &&
      ticketWithExtend.isGoodReview == null
    ) {
      if (!bottomSheetRef || !bottomSheetRef.current) return;
      // setIsOpen(true);
      bottomSheetRef?.current?.snapToIndex(0);
    }
  }, [ticketWithExtend]);

  var time = `${dayjs(route.params.startTime).format("HH:mm")} - ${dayjs(
    route.params.endTime
  ).format("HH:mm")}`;

  if (route.params.state == "completed") {
    time = `${dayjs(route.params.entryTime).format("HH:mm")} - ${dayjs(
      route.params.exitTime
    ).format("HH:mm")}`;
  }

  const onRefresh = async () => {
    Spinner.show();
    setRefreshing(true);
    const res = await ticketApi.getOneWithExtend(ticketWithExtend.id);
    if (res.data) {
      setTicketWithExtend(res.data);
    } else {
      Alert.alert("Fail when get detail ticket");
    }
    Spinner.hide();
    setRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      Spinner.show();
      const res = await ticketApi.getOneWithExtend(ticketWithExtend.id);
      if (res.data) {
        setTicketWithExtend(res.data);
      } else {
        Alert.alert("Fail when get detail ticket");
      }
      Spinner.hide();
    })();
  }, []);

  const onDelete = () => {
    Alert.alert("Are your sure?", "Are you sure you want to remove this?", [
      {
        text: "Yes",
        onPress: () => {
          dispatch(
            ticketActions.cancelTicket({
              id: ticketWithExtend.id,
              state: ticketWithExtend.state,
            })
          );
          navigation.goBack();
        },
      },
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
      },
    ]);
  };

  const reviewItem = [
    { value: true, label: "Good", accentColor: Colors.light.success },
    { value: false, label: "Not good", accentColor: Colors.light.warning },
  ];

  const captureAndShare = async () => {
    try {
      const uri = await ref.current.capture();
      await shareImage(uri);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  const shareImage = async (uri: any) => {
    try {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Image",
      });
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  const handleExtendTicket = () => {
    navigation.navigate("ExtendTicketScreen", { ticketWithExtend });
  };

  const handleReBook = () => {
    navigation.navigate("ParkingDetailsScreen", {
      parkingLotId: ticketWithExtend.parkingLot.id,
    });
  };

  const handleReviewTicket = async () => {
    Spinner.show();
    try {
      await ticketApi.reviewTicket(ticketWithExtend.id, isGoodReview, review);
      // setIsOpen(false);
      bottomSheetRef?.current?.snapToIndex(-1);
      Alert.alert("Thanks for your review!");
      onRefresh();
    } catch (e) {
      Alert.alert("We can not receive your review at this moment!");
    }
    Spinner.hide();
  };

  const handleOpenMap = () => {
    const latLng = `${ticketWithExtend.parkingLot.lat},${ticketWithExtend.parkingLot.long}`;
    const mapUrl = `google.navigation:q=${latLng}`;
    Linking.openURL(mapUrl);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerText}>Parking ticket</Text>
        </View>
        {ticketWithExtend.state != CANCEL_STATE &&
          ticketWithExtend.state != COMPLETED_STATE &&
          ticketWithExtend.state != ONGOING_STATE && (
            <TouchableOpacity style={styles.delete} onPress={onDelete}>
              <TrashIcon color={Colors.light.danger} />
            </TouchableOpacity>
          )}
        <TouchableOpacity style={styles.copy} onPress={captureAndShare}>
          <ClipboardDocumentListIcon size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{
          paddingVertical:
            ticketWithExtend.state == ONGOING_STATE ||
            ticketWithExtend.state == COMPLETED_STATE
              ? 4
              : 24,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingBottom: 96 }}>
          <View style={styles.card}>
            <Text style={styles.note}>
              {ticketWithExtend.state == "completed" ||
              ticketWithExtend.state == "cancel"
                ? "QR code expired!"
                : "Scan this when you are in the parking lot"}
            </Text>
            <ViewShot ref={ref} options={{ format: "png" }}>
              <View style={styles.imageView}>
                <AppQRCode
                  size={200}
                  content={"parking" + ticketWithExtend.id}
                />
              </View>
            </ViewShot>
          </View>

          <Text style={styles.dash} ellipsizeMode="clip" numberOfLines={1}>
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            - - - - - - - - - - - - - - - - - - - -
          </Text>
          <View
            style={[
              styles.card,
              { alignItems: "flex-start", paddingVertical: 12 },
            ]}
          >
            <Item title={"Name"} value={userState?.displayName} />
            <Item
              title={"Parking area"}
              value={ticketWithExtend.parkingLot?.name}
            />
            <TouchableOpacity onPress={handleOpenMap}>
              <Text style={styles.address}>
                {ticketWithExtend.parkingLot?.address}{" "}
                <Text style={{ color: Colors.light.tint }}>
                  (Press to open on map)
                </Text>
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Item
                  title={"Parking spot"}
                  value={`${ticketWithExtend.parkingSlot.block.code} - ${ticketWithExtend.parkingSlot?.name}`}
                />
                <Item
                  title={"Date"}
                  value={DateTimeHelper.formatDate(ticketWithExtend?.startTime)}
                />
                <Item title={"Phone number"} value={userState?.phoneNumber} />
              </View>
              <View style={{ flex: 1 }}>
                <Item
                  title={"Duration"}
                  value={DateTimeHelper.convertToHour(
                    ticketWithExtend?.timeFrame?.duration
                  )}
                />
                {ticketWithExtend.state == "cancel" && (
                  <Item title="Cancelled" value="" color="red" />
                )}
                {ticketWithExtend.state != "cancel" && (
                  <Item title={"Hours"} value={time} />
                )}
                <Item
                  title={"Vehicle"}
                  value={`${ticketWithExtend?.vehicle?.name} (${ticketWithExtend?.vehicle?.number})`}
                />
              </View>
            </View>
          </View>
          {/* extend */}
          {ticketWithExtend.isExtend &&
            ticketWithExtend.ticketExtend &&
            ticketWithExtend.ticketExtend.map((e, i) => {
              var hour = `${dayjs(e.startTime).format("HH:mm")} - ${dayjs(
                e.endTime
              ).format("HH:mm")}`;
              var duration =
                (dayjs(e.endTime).hour() - dayjs(e.startTime).hour()) * 60 +
                (dayjs(e.endTime).minute() - dayjs(e.startTime).minute());
              const status = dayjs(e.endTime).isSameOrBefore(new Date())
                ? "Expried"
                : "Valid";
              return (
                <View style={{ marginTop: -12 }}>
                  <Text
                    style={styles.dash}
                    ellipsizeMode="clip"
                    numberOfLines={1}
                  >
                    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    - - - - - - - - - - - - - - - - - - - - - - - -
                  </Text>
                  <View
                    key={e.id}
                    style={[
                      styles.card,
                      { alignItems: "flex-start", paddingVertical: 12 },
                    ]}
                  >
                    <Text
                      style={{
                        width: "100%",
                        textAlign: "center",
                        fontSize: 20,
                        color: Colors.light.primary,
                      }}
                    >
                      Extend#{i + 1}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <View style={{ flex: 1 }}>
                        <Item title={"Status"} value={status} />
                        <Item
                          title={"Date"}
                          value={DateTimeHelper.formatDate(e?.startTime)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Item title={"Duration"} value={duration.toString()} />
                        <Item title={"Hours"} value={hour} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>

      {ticketWithExtend.state == ONGOING_STATE && (
        <AppButton style={styles.continueButton} onPress={handleExtendTicket}>
          <Text style={styles.countinueText}>Extend ticket</Text>
        </AppButton>
      )}

      {ticketWithExtend.state == CANCEL_STATE ||
        (ticketWithExtend.state == COMPLETED_STATE && (
          <AppButton style={styles.continueButton} onPress={handleReBook}>
            <Text style={styles.countinueText}>Book again</Text>
          </AppButton>
        ))}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose={true}
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
              display: "flex",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 8 }}>
              How was your experience
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 24,
                justifyContent: "center",
              }}
            >
              {reviewItem.map(({ value, label, accentColor }) => (
                <SelectableReviewItem
                  accentColor={accentColor}
                  text={label}
                  checked={isGoodReview == value}
                  handleSelect={() => {
                    setIsGoodReview(value);
                  }}
                />
              ))}
            </View>
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Your review"
              placeholderTextColor="#CBD5E1"
              value={review}
              onChangeText={setReview}
              style={styles.reviewInput}
            />
            <AppButton onPress={handleReviewTicket}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
                Submit
              </Text>
            </AppButton>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default BookingTicketScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 20,
    color: Colors.light.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  copy: {},
  card: {
    marginHorizontal: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#6F7EC9",
    shadowOffset: {
      width: -1,
      height: -1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    alignItems: "center",
  },
  note: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.subtitle,
    marginBottom: 12,
  },
  code: { width: 180, height: 180 },
  dash: { marginHorizontal: 24, marginVertical: 12 },
  bottom: {
    flexDirection: "row",
  },
  flex: {
    alignItems: "flex-start",
    marginVertical: 8,
  },
  title: { fontSize: 12, fontWeight: "500", color: Colors.light.subtitle },
  value: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  address: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 12,
  },
  continueButton: {
    marginTop: 12,
    position: "absolute",
    bottom: 10,
    right: 20,
    left: 20,
  },
  countinueText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: "600",
  },
  imageView: {
    padding: 12,
    backgroundColor: Colors.light.background,
  },
  delete: { paddingRight: 10 },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#90A3BC",
    padding: 12,
    color: Colors.light.text,
    textAlignVertical: "top",
  },
});
