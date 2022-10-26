import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Button,
} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Main = () => {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({});

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("notes");
      setNotes(jsonValue != null ? JSON.parse(jsonValue) : []);
    } catch (e) {}
  };

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem("notes", jsonValue);
    } catch (e) {}
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalItem}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={async () => {
                if (notes.length === 0) {
                  setNotes([
                    {
                      title: modalData.title,
                      description: modalData.description,
                      id: 1,
                      date: new Date().toLocaleString(),
                    },
                  ]);
                  await storeData([
                    {
                      title: modalData.title,
                      description: modalData.description,
                      id: 1,
                      date: new Date().toLocaleString(),
                    },
                  ]);
                } else {
                  const filteredNotes = notes.filter(
                    (note) => note.id !== modalData.id
                  );
                  filteredNotes.push({
                    title: modalData.title,
                    description: modalData.description,
                    id: modalData.id,
                    date: new Date().toLocaleString(),
                  });
                  setNotes(filteredNotes);
                  await storeData(filteredNotes);
                }

                setModalVisible(!modalVisible);
              }}
            >
              <Text style={styles.textStyle}>Save</Text>
            </TouchableOpacity>
            <View style={styles.modalTitle}>
              <TextInput
                style={styles.modalTitleValue}
                value={modalData.title}
                onChangeText={(text) => {
                  setModalData({ ...modalData, title: text });
                  setNotes(
                    notes.map((item) => {
                      if (item.id === modalData.id) {
                        item.title = text;
                      }
                      return item;
                    })
                  );
                }}
              />
            </View>
            <ScrollView>
              <View style={styles.modalDescription}>
                <TextInput
                  style={styles.modalDescriptionValue}
                  value={modalData.description}
                  onChangeText={(text) => {
                    setModalData({ ...modalData, description: text });
                    setNotes(
                      notes.map((item) => {
                        if (item.id === modalData.id) {
                          item.description = text;
                        }
                        return item;
                      })
                    );
                  }}
                  multiline={true}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.search}>
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={search}
          onChangeText={(e) => setSearch(e)}
        />
      </View>

      <View style={styles.itemContainer}>
        {notes.length > 0 ? (
          <FlatList
            scrollEnabled={true}
            data={notes}
            renderItem={({ item }) => {
              if (item?.title.toLowerCase().includes(search.toLowerCase())) {
                return (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                      setModalVisible(true);
                      setModalData(item);
                    }}
                  >
                    <View style={styles.itemDesc}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.delButton}
                      onPress={async () => {
                        const newNotes = notes.filter(
                          (note) => note.id !== item.id
                        );

                        setNotes(newNotes);
                        await storeData(newNotes);
                      }}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              } else {
                return <View></View>;
              }
            }}
          />
        ) : (
          <View>
            <Text>No notes</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setModalVisible(true);
          setModalData({
            id: notes.length + 1,
            title: "Unititled",
            description: "",
            date: new Date().toISOString().slice(0, 10),
          });
        }}
      >
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "100%",
  },

  search: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    paddingHorizontal: 30,
    margin: 10,
    borderRadius: 20,
    width: "100%",
  },

  input: {
    fontSize: 18,
    color: "#333",
  },
  itemContainer: {
    flex: 1,
    // padding: 1,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    backgroundColor: "#eee",
    padding: 10,
    marginVertical: 10,
    borderBottomWidth: 4,
    borderBottomColor: "#aaa",
  },
  itemDesc: {
    flex: 5,
  },
  delButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "yellow",
    padding: 20,
    position: "absolute",
    bottom: 25,
    right: 10,
    borderRadius: 50,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 20,
    paddingVertical: 100,
  },

  modalItem: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 10,
    borderBottomColor: "#aaa",
    borderBottomWidth: 1,
    paddingBottom: 5,
  },

  modalTitleValue: {
    padding: 5,
    fontSize: 18,
    backgroundColor: "#eeee",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  modalDescription: {
    height: 600,
    backgroundColor: "#eeee",
  },
  modalDescriptionValue: {
    padding: 5,
    fontSize: 14,
  },
  modalClose: {
    backgroundColor: "skyblue",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: "flex-end",
    alignItems: "center",
  },
});

export default Main;
