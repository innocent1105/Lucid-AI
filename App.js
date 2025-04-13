import React, { useEffect, useState } from 'react';
import { useRef } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';
import { Audio } from 'expo-av';


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef(null);

  // audio
  const [sound, setSound] = useState();

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/messenger.mp3') // put your audio file in /assets
    );
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); // cleanup
        }
      : undefined;
  }, [sound]);


  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    let systemPrompt = {
      "system_instructions" : "be brief and use very good friendly emojies, ask questions for more engangement and better interactions."
    } 

    systemPrompt = JSON.stringify(systemPrompt, true);
    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDsoOEqTTpgfP2HwwmD5RCqhWzXxCOi5Ps",
        {
          contents: [{ parts: [{ text: prompt + systemPrompt }] }],
        }
      );

      if (res && res.data) {
        // sound 
        playSound();

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      const reply = res.data.candidates[0].content.parts[0].text;
      const botMessage = { role: "bot", text: reply };

      // formating

      setMessages((prev) => [...prev, botMessage]);


    } catch (err) {
      console.error(err);
      const errorMessage = { role: "bot", text: "Please check your internet connection and try again." };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lucid AI</Text>
  
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        ref={scrollViewRef}
      >
        {messages.map((msg, index) => (
        <View
          key={index}
          style={[
            styles.message,
            msg.role === "user" ? styles.userMsg : styles.botMsg,
          ]}
        >
          {msg.role === "bot" ? (
            <Markdown style={styles.markdown}>{msg.text}</Markdown>
          ) : (
            <Text style={[styles.messageText, styles.userText]}>{msg.text}</Text>
          )}
        </View>
        ))
        }

        {loading && <ActivityIndicator size="small" color="#2563eb" />}
      </ScrollView>
  
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendPrompt}
          disabled={loading}
        >
      <TouchableOpacity style={styles.sendButton} onPress={sendPrompt}>
        <Ionicons name="arrow-up" size={20} color="#fff" />
      </TouchableOpacity>

        </TouchableOpacity>
      </View>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f3f4f6",
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    padding: 10,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  message: {
    maxWidth: "95%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    color: "#fff",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#eee",
    // color: "#ffffff",
  },
  botMsg: {
    alignSelf: "flex-start",
  },
  // messageText: {
  //   color: "#111827",
  // },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingBottom: 20,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
