import React from 'react';
import { Image, Button, StyleSheet, Text, View } from 'react-native';
import { AuthSession } from 'expo';

const FB_APP_ID = '193220928115144';

export default class App extends React.Component {
  state = {
    userInfo: null,
  };

  render() {
    return (
      <View id="1" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {!this.state.userInfo ? (
          <Button title="Open FB Auth" onPress={this._handlePressAsync} />
        ) : (
            this._renderUserInfo()
          )}
      </View>
    );
  }

  _renderUserInfo = () => {
    const { friends, summary, id, name, picture, email, gender } = this.state.userInfo;

    return (
      <View id="2" style={{ alignItems: 'center' }}>
        <Image
          source={{ uri: picture.data.url }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <Text style={{ fontSize: 20 }}>{name}</Text>
        <Text>Id: {id}</Text>
        <Text>Gender: {gender}</Text>
        <Text>Email: {email}</Text>
        <Text>Total of friends: {friends.summary.total_count}</Text>
        <Text>{"\n"}</Text>
        <Text>List of friends in your app !</Text>
        {
          friends.data.map(({id, name}) => (
            <View key={id}>
              <Text>ID: {id}</Text>
              <Text>Name: {name}</Text>
            </View>
          ))
        }
      </View>
    );
  };

  _handlePressAsync = async () => {
    let redirectUrl = AuthSession.getRedirectUrl();

    // You need to add this url to your authorized redirect urls on your Facebook app
    console.log({ redirectUrl });

    // NOTICE: Please do not actually request the token on the client (see:
    // response_type=token in the authUrl), it is not secure. Request a code
    // instead, and use this flow:
    // https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/#confirm
    // The code here is simplified for the sake of demonstration. If you are
    // just prototyping then you don't need to concern yourself with this and
    // can copy this example, but be aware that this is not safe in production.

    let result = await AuthSession.startAsync({
      authUrl:
        `https://www.facebook.com/v2.8/dialog/oauth?response_type=token` +
        `&client_id=${FB_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&scope=public_profile,user_friends,email`,
    });

    if (result.type !== 'success') {
      alert('Uh oh, something went wrong');
      return;
    }

    let accessToken = result.params.access_token;
    let userInfoResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,friends,gender,picture.type(large)`
    );
    const userInfo = await userInfoResponse.json();
    this.setState({ userInfo });
  };
}
