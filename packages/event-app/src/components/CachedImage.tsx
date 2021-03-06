import sha256 from 'crypto-js/sha256';
import {Asset} from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import React, {useEffect, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  StyleProp,
  ImageSourcePropType,
  Platform,
  Animated,
} from 'react-native';

type Props = {
  source: {uri: string} | number;
  style: StyleProp<any>;
  animated?: boolean;
};

export default function CachedImage(props: Props) {
  const [source, setSource] = useState<ImageSourcePropType | null>(null);

  let unmounting = false;

  async function fetchPicture() {
    let source: ImageSourcePropType = props.source;

    try {
      if (typeof source === 'number') {
        await Asset.fromModule(source).downloadAsync();
      } else if (source && source.uri && Platform.OS !== 'web') {
        const name = sha256(source.uri);
        const filepath = `${FileSystem.documentDirectory}${name}.png'`;
        const {exists} = await FileSystem.getInfoAsync(filepath);
        if (exists) {
          source = {uri: filepath};
        } else {
          const {uri} = await FileSystem.downloadAsync(source.uri, filepath);
          source = {uri};
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (!unmounting) {
        setSource(source);
      }
    }
  }

  useEffect(() => {
    fetchPicture();
    return function unmount() {
      unmounting = true;
    };
  }, []);

  if (source && !props.animated) {
    return <Image {...props} source={source} />;
  } else if (source && props.animated) {
    return <Animated.Image {...props} source={source} />;
  } else if (!source && props.animated) {
    const safeImageStyle = {...StyleSheet.flatten(props.style)};
    delete safeImageStyle.tintColor;
    delete safeImageStyle.resizeMode;
    return (
      <Animated.View style={[{backgroundColor: '#eee'}, safeImageStyle]} />
    );
  } else {
    const safeImageStyle = {...StyleSheet.flatten(props.style)};
    delete safeImageStyle.tintColor;
    delete safeImageStyle.resizeMode;
    return <View style={[{backgroundColor: '#eee'}, safeImageStyle]} />;
  }
}
