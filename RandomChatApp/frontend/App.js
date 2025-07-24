import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  let socket;

  useEffect(() => {
    socket = new WebSocket('ws://localhost:3000');
    socket.onmessage = event => {
      setMessages(prev => [...prev, event.data]);
    };
    return () => socket.close();
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.send(input);
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        style={styles.input}
        onChangeText={setInput}
        value={input}
        placeholder="Type a message"
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10
  }
});
