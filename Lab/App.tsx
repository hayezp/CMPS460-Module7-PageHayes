
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList,
  TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = 'module7_tasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) setTasks(JSON.parse(saved));
      } catch (error) {
        Alert.alert('Error', 'Unable to load saved tasks.');
      } finally {
        setLoaded(true);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        Alert.alert('Error', 'Unable to save tasks.');
      }
    };
    saveTasks();
  }, [tasks, loaded]);

  const addTask = () => {
    const title = taskInput.trim();
    if (!title) return;
    const newTask: Task = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      completed: false
    };
    setTasks(current => [...current, newTask]);
    setTaskInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(current => current.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(current => current.filter(task => task.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Persistent Task Manager</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a new task"
        value={taskInput}
        onChangeText={setTaskInput}
      />
      <Button title="Add Task" onPress={addTask} />
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity
              style={styles.taskText}
              onPress={() => toggleTask(item.id)}
            >
              <Text style={item.completed ? styles.completed : styles.normal}>
                {item.completed ? '✓ ' : '○ '}{item.title}
              </Text>
            </TouchableOpacity>
            <Button
              title="Delete"
              color="red"
              onPress={() => deleteTask(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 25, paddingTop: 70,
    backgroundColor: '#f4f4f4'
  },
  heading: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: 'white', padding: 12, borderWidth: 1,
    borderColor: '#ccc', marginBottom: 12, borderRadius: 8
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 8,
    padding: 10, backgroundColor: 'white', borderRadius: 8
  },
  taskText: { flex: 1 },
  normal: { fontSize: 16 },
  completed: {
    fontSize: 16, textDecorationLine: 'line-through', color: 'gray'
  }
});
