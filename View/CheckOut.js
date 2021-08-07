import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Alert } from 'react-native';
import {connect} from 'react-redux'
import {firebase} from '../firebase/config'
import * as Font from 'expo-font'
import {AppLoading} from 'expo'
import moment from 'moment'

let customFonts = {
  'Medium': require('../Fonts/Roboto-Medium.ttf'),
  'Bold': require('../Fonts/Roboto-Bold.ttf'),
  'Black': require('../Fonts/Roboto-Black.ttf'),
  'Light': require('../Fonts/Roboto-Light.ttf'),
  'Regular': require('../Fonts/Roboto-Regular.ttf')
}



const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

class CheckOut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.cartItems,
      total: this.props.total,
      trackingNo: this.makeTrackingNumber(8),
      name: '',
      Address:'',
      Phone:'',
      fontLoaded: false,
      myCreditLimit: 0,
      orderQty: 0
    };
  }



  readData = ()=> {
    firebase.database().ref().child("Users/details").orderByChild("ClockNumber").equalTo(firebase.auth().currentUser.email).on('value', snapshot => {
      if (snapshot.exists()) {
        var usersDetail = snapshot.val()
        var keys = Object.keys(usersDetail)
        var myKeys = Object.keys(usersDetail).toString()
        for (var i = 0; i < keys.length; i++) {
        var k = keys[i]
        var displayName = usersDetail[k].DisplayName
        var creditLimit = usersDetail[k].CreditLimit
        }
        this.setState({myCreditLimit:creditLimit})
        
        
      }
    })
  }

  

  firebaseWrite = ()=> {
       //FIREBASE WRITE:
       firebase.database().ref().child("Users/details").orderByChild("ClockNumber").equalTo(firebase.auth().currentUser.email).once('value', snapshot => {
        if (snapshot.exists()) {
          var usersDetail = snapshot.val()
          var keys = Object.keys(usersDetail)
          var myKeys = Object.keys(usersDetail).toString()
          for (var i = 0; i < keys.length; i++) {
          var k = keys[i]
          var displayName = usersDetail[k].DisplayName
          var creditLimit = usersDetail[k].CreditLimit
          }
         
            firebase.database().ref('Transactions/' + displayName + '/' + this.state.trackingNo).push({
              OrderDate: moment().format('DD/MM/YYYY, h:mm:ss a'),
              Item: this.state.item ,
              Total: this.state.total
          }).then(
              ()=> {
                  
                  firebase.database().ref('Users/details/').child(myKeys).child('CreditLimit').set(firebase.database.ServerValue.increment(-this.state.total)).then(()=>{this.setState({total: 0})})
                  
                  
              }
          ).then(()=>{
            firebase.database().ref().child('Products/').on('value', snapshot => {
              var productData = []
                snapshot.forEach((childSnapShot)=>{
                  productData.push(childSnapShot.val())
                })
                 var orderQty = this.state.item.map(function (oItem) {
                   return {
                     orderQty: oItem.qty
                   }
                 })
                 console.log(orderQty[0])
                 var char = productData.map(function (item) {
                  return {id: item.id,
                          name: item.name,
                          price: item.price,
                          qty: item.qty,
                          AvailableQty: item.AvailableQty
                        }
                })
                this.setState({productss:char})
                
                
            })
          }).catch((error)=>{
              console.log(error)
          })
          
            
          
         
        } 
       })
   
  }

  
  makeTrackingNumber = (lenght) => {
      var result = ''
      var character = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      var characterLenght = character.length
      for (var i = 0; i < lenght; i++) {
        result += character.charAt(Math.floor(Math.random() * characterLenght))
      }
      return result
  }

  confirmOrder = () => {
      
      Alert.alert(
        'ORDER CONFIRMED',
        'Dear customer, Thank you for shopping with us. A confirmation text containing your order number'+' '+ this.state.trackingNo + ' ' + 'will be sent to you shortly.',
        [{
          text: 'Ok',
          onPress: ()=>{this.props.clear(this.props.cartItems); this.props.navigation.navigate('Home');
      }
        }],
        {cancelable: false}
      )
    
    
}

  // Fonts Loaded Async
async _loadFontsAsync() {
    await Font.loadAsync(customFonts)
    this.setState({fontLoaded: true})
  }


  componentDidMount() {
   
    //this.readData()
    this._loadFontsAsync()

   }


  render() {
   

    if (this.state.fontLoaded) {
    return (
      <View style={styles.container}>
       <View style={styles.headerView}>
         <TouchableOpacity style={styles.backView} onPress={()=>this.props.navigation.navigate('CartScreen')}>
           <Image source={require('../assets/smallback.png')} style={{width: 30, height:'100%', tintColor:'#fff'}}/>
           <Text style={{fontSize: 16, color: '#fff', fontWeight:'600', fontFamily:'Black'}}>Back to cart</Text>
         </TouchableOpacity>
         <View style={styles.checkOutView}>
            <Text style={styles.Text}>CheckOut</Text>
         </View>
       </View>

        <View style={styles.shippingView}>
          <View style={{flexDirection: 'row', paddingLeft: 40, marginTop: 10}}>
            <Text style={{fontSize: 25, fontWeight: '700'}}>1.</Text>
            <Text style={{fontSize: 25, fontWeight: '700'}}> Shipping</Text>
            <TouchableOpacity style={{width:'50%', alignItems:'flex-end', justifyContent:'center'}} onPress={()=>this.props.navigation.navigate('Details')}>
              <Text style={{fontWeight:'700', color:'#333'}}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={{paddingLeft:40}}> Delivery Address</Text>
          <Text style={{paddingLeft:40, color: 'grey', textAlign:'left', width:'90%', fontSize:20, paddingTop:10}}>{this.state.Address}</Text>
          <Text style={{paddingLeft:40, color: 'grey', textAlign:'left', width:'90%',fontSize:20, fontWeight:'700'}}>{this.state.Phone}</Text>
        </View>





        <View style={styles.paymentView}>
        <View style={{flexDirection: 'row', paddingLeft: 40, marginTop: 10}}>
            <Text style={{fontSize: 25, fontWeight: '700'}}>2.</Text>
            <Text style={{fontSize: 25, fontWeight: '700'}}> Payment</Text>
          </View>
          <Text style={{paddingLeft:40}}> Choose a Payment Method</Text>
        </View>




        <View style={styles.reviewView}>
          <View style={{flexDirection: 'row', paddingLeft: 40, marginTop: 10}}>
            <Text style={{fontSize: 25, fontWeight: '700'}}>3.</Text>
            <Text style={{fontSize: 25, fontWeight: '700'}}> Review</Text>
          </View>
    <Text style={{paddingLeft:40, fontFamily: 'Black', fontSize: 18, color:'#6D2775'}}> Subtotal---------------- ₦{this.props.total}.00</Text>
          <Text style={{paddingLeft:40,fontFamily: 'Black', fontSize: 18, color:'#6D2775'}}> Shipping---------------- ₦0.00 </Text>
          <Text style={{paddingLeft:40,fontFamily: 'Black', fontSize: 18, color:'#6D2775'}}> Total---------------- ₦{this.props.total}.00</Text>
        </View>

        <TouchableOpacity onPress={()=>{this.firebaseWrite(); this.confirmOrder()}}
                            style={{width:screenWidth/1.3, height: 60, backgroundColor: '#6D2775', alignItems:'center', justifyContent:'center', borderRadius:4, marginTop: 10}}>
            <Text style={styles.footerText}>Place Order</Text>
            
          </TouchableOpacity>

      </View>
    );
  } else {
      return <AppLoading/>
  }
}
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
      
        
    },
    headerView: {
      backgroundColor: '#6D2775',
      width: '100%',
      height: screenHeight/5,
      flexDirection:'column'
    },
    backView: {
      flexDirection: 'row',
      width: '100%',
      //backgroundColor: 'blue',
      height: '30%',
      marginTop: 40,
      padding: 10
    },
    checkOutView: {
      justifyContent:'center',
      height: '40%',
      //backgroundColor: 'yellow',
    },
    Text: {
      fontSize: 40,
      fontWeight: '700',
      paddingLeft: 15,
      color: '#fff'
    },
    shippingView: {
      height: screenHeight/4,
      width: '100%',
      //backgroundColor: 'green'
    },
    paymentView: {
      height: screenHeight/5,
      width: '100%',
     // backgroundColor: 'yellow'
    },
    reviewView: {
      height: screenHeight/5,
      width: '100%',
      //backgroundColor: 'orange'
    },
    footerText:{
      fontSize: 20,
      fontWeight: '700',
      color: '#fff'
    },
});

const mapStateToProps = (state) => {
  return {
    cartItems: state,
    total: state.reduce((prev, next)=> prev + next.price * next.qty,0)
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    clear: (product)=>dispatch({type: 'CLEAR', payload:product})
  }
}

export default connect (mapStateToProps, mapDispatchToProps)(CheckOut);
