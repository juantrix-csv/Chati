import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';

export default function App() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socket = useRef(null);

  useEffect(() => {
    if (connected) {
      socket.current = new WebSocket('ws://localhost:3000');
      socket.current.onmessage = event => {
        setMessages(prev => [...prev, event.data]);
      };
      return () => socket.current.close();
    }
  }, [connected]);

  const connect = () => {
    if (name.trim() && age.trim()) {
      setConnected(true);
    }
  };

  const sendMessage = () => {
    if (input.trim() && socket.current) {
      socket.current.send(`${name}: ${input}`);
      setInput('');
    }
  };

  const newChat = () => {
    if (socket.current) {
      socket.current.close();
    }
    setMessages([]);
    setConnected(false);
  };

  if (!connected) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Edad"
          value={age}
          keyboardType="numeric"
          onChangeText={setAge}
        />
        <Button title="Conectar" onPress={connect} />
      </View>
    );
  }

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
        placeholder="Escribí un mensaje"
      />
      <Button title="Enviar" onPress={sendMessage} />
      <View style={{ height: 10 }} />
      <Button title="Nuevo chat" onPress={newChat} />
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
