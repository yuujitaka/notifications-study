import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [goal, setGoal] = useState("");
  const [goalList, setGoalList] = useState([]);
  const [deletIndex, setDeletIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const addGoalHandler = () => {
    // first way
    //setGoalList([goal, ...goalList]);

    // better way
    if (goal) {
      setGoalList((currentGoalList) => [goal, ...currentGoalList]);
      setGoal("");
    }
  };

  const pressGoalHanlder = (index) => {
    setModalVisible(true);
    setDeletIndex(index);
  };

  const onDeleteGoal = () => {
    setGoalList((currentGoalList) =>
      currentGoalList.filter((_, i) => i !== deletIndex)
    );
    setModalVisible(false);
  };

  const scheduleNotification = (item) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Time's up!",
        body: item,
        data: { user: "Rebeca" },
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  useEffect(() => {
    const configPushNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Failed to get push token for push notification!"
        );
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      console.log(token);

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };

    configPushNotifications();
  }, []);

  useEffect(() => {
    const subscriptionReceived = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("RECEIVED");
        console.log(notification);
      }
    );

    const subscriptionResponse =
      Notifications.addNotificationResponseReceivedListener((notification) => {
        console.log("RESPONDED");
        console.log(notification);
      });

    return () => {
      subscriptionReceived.remove();
      subscriptionResponse.remove();
    };
  }, []);

  const sendPushNotificationHandler = () => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[MNDc61NAtstPZ4nRD4PKr0]",
        title: "teste",
        body: "testing inside code",
      }),
    });
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.appContainer}>
        <View>
          <Image source={require("./assets/icon.png")} style={styles.image} />
          <Button onPress={sendPushNotificationHandler} title="Send Push" />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Your course goal"
            onChangeText={setGoal}
            value={goal}
          />
          <Button title="Add Goal" onPress={addGoalHandler} />
        </View>
        <View style={styles.goalsContainer}>
          <FlatList
            data={goalList}
            renderItem={({ item, index }) => (
              <View style={styles.goalItem}>
                <Text style={styles.goalText}>{item}</Text>
                <View style={styles.icons}>
                  <View style={styles.alarm}>
                    <Pressable
                      onPress={() => scheduleNotification(item)}
                      android_ripple={{ color: "#00ffae", borderless: true }}
                      style={({ pressed }) => {
                        if (pressed && Platform.OS === "ios")
                          return styles.pressed;
                      }}
                    >
                      <Ionicons name="alarm" size={24} color="white" />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => pressGoalHanlder(index)}
                    android_ripple={{ color: "red", borderless: true }}
                    style={({ pressed }) => {
                      if (pressed && Platform.OS === "ios")
                        return styles.pressed;
                    }}
                  >
                    <Ionicons name="trash-bin" size={24} color="white" />
                  </Pressable>
                </View>
              </View>
            )}
            alwaysBounceVertical={false}
          />
        </View>
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modal}>
            <Text>Deseja excluir esse item?</Text>
            <View style={styles.modalButtons}>
              <Button
                onPress={() => {
                  onDeleteGoal();
                }}
                title="Sim"
                color="red"
              />
              <Button
                onPress={() => {
                  setModalVisible(false);
                }}
                title="Não"
                color="blue"
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flex: 1,
  },
  image: {
    width: 100,
    height: 100,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    flex: 1,
    marginRight: 8,
    padding: 8,
  },
  goalsContainer: {
    flex: 4,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    marginVertical: 8,
    borderRadius: 6,
    backgroundColor: "#5e0acc",
  },
  icons: {
    flexDirection: "row",
  },
  alarm: {
    marginRight: 8,
  },
  pressed: {
    backgroundColor: "rgba(255,0,0,0.5)",
    borderRadius: 6,
  },
  goalText: {
    padding: 8,
    color: "white",
  },
  modal: {
    padding: 16,
    backgroundColor: "white",
    height: 100,
    marginTop: "auto",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
