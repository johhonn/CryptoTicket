import React, { Component } from 'react'
import SimpleTicketContract from './SimpleTicket.json'
import './App.css'

import getWeb3 from './utils/getWeb3'
import QReader from './Reader.js'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
var QRCode = require('qrcode-react');



class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      cost: 0,
      tickets:0,
      available:0,
      amount:0,
      number:0,
      web3: null,
      showqr:false,
      showbuy:false,
      showscan:false,
      showprint:false,
      showscanner:false,
      ticketinfo:null,
      buy:null,
      print:null,
      qrcode:null,
      ticketscanner:null
    }
    this.handleTransfer=this.handleTransfer.bind(this);
  }

  componentWillMount=()=> {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      console.log(this.state.web3)
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract=()=> {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const simpleTicket = contract(SimpleTicketContract)
    simpleTicket.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleTicketInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleTicket.deployed().then((instance) => {
        simpleTicketInstance = instance
        var account = accounts[0];
        console.log(account)
        // Stores a given value, 5 by default.
        return simpleTicketInstance.returnparams.call(account)
      }).then((result) => {
        console.log(result[2].toString())
        // Get the value from the contract to prove it worked.
              // Update state with the result.

              this.setState({cost:result[1].toString(), available:result[2].toString(), tickets:result[0].toString() })
      })
    })
  }

  handleTransfer=()=>{
    const contract = require('truffle-contract')
    const simpleTicket = contract(SimpleTicketContract)
    simpleTicket.setProvider(this.state.web3.currentProvider)
    var that=this
    var cost=this.state.cost
    var amount=this.state.amount
    var w=this.state.web3
    var simpleTicketInstance
    this.state.web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      console.log(cost)
      var account = accounts[0];
      simpleTicket.deployed().then(function(instance) {
      simpleTicketInstance = instance;


      var totalcost=amount*cost
      console.log(totalcost)
      return simpleTicketInstance.SendTicket( amount, {value: w.toWei(totalcost.toString(), 'ether'), from: account});
      }).then(function(result) {
        alert('Transfer Successful!');
        console.log(result)
        that.instantiateContract()
      }).catch(function(err) {
        console.log(err.message);
      });
    });


  }

printTicket=()=>{
  const contract = require('truffle-contract')
  const simpleTicket = contract(SimpleTicketContract)
  simpleTicket.setProvider(this.state.web3.currentProvider)
  var N=this.state.number
  var w=this.state.web3
  var that=this
  var simpleTicketInstance;
  console.log('started')
  this.state.web3.eth.getAccounts(function(error, accounts) {
   if (error) {
     console.log(error);
   }
   var account = accounts[0];
   simpleTicket.deployed().then(function(instance) {
   simpleTicketInstance = instance;
    return simpleTicketInstance.printTT(account,N).then(function(result){
       var R=result;
       var hash=0;
       var key=0;
       console.log(R[0]);
       console.log(R[1].c)
     hash=R[0]
     key=R[1]
     key="" + key
     if(key.length<3){
       while(key.length<3){
          key=0+key
       }
     }
     console.log(key+hash)
     var final= w.sha3(key+hash);
     var from = account;
     var params = [final, from]
     var method = 'personal_sign'
    w.currentProvider.sendAsync({
    method,
    params,
    from,
   }, function (err, result) {
   if (err) return console.error(err)
   if (result.error) return console.error(result.error)
   console.log('PERSONAL SIGNED:' +result.result)
      var message=result.result+key
      that.setState({qrcode:message})
      that.setState({showqr:true})
   })
     }).catch(function(err) {
     console.log(err.message);
   });
  })
     }
 )
}

ReadSig=(account,message,hash)=>{
  var m=message
 console.log(m)
  var from= account
  var signed=hash.substring(3,hash.length)
  console.log(signed)
   var  method = 'personal_ecRecover'
   var params = [m,signed ]
   this.state.web3.currentProvider.sendAsync({
     method,
     params,
     from,
   }, function (err, result) {
     var recovered = result.result
     console.log('ec recover called back:')
     console.dir({ err, recovered })
     if (err) return console.error(err)
     if (result.error) return console.error(result.error)
     if (recovered === from ) {
       console.log('Successfully ecRecovered signer as ' + from)
       this.Redeemm(recovered)
     } else {
       console.log('Failed to verify signer when comparing ' + result + ' to ' + from)
     }

   })
 }
 Redeemm=(User)=>{
   const contract = require('truffle-contract')
   const simpleTicket = contract(SimpleTicketContract)
 var simpleTicketInstance
 simpleTicket.setProvider(this.state.web3.currentProvider)
 this.state.web3.eth.getAccounts(function(error, accounts) {
 if (error) {
   console.log(error);
 }
  var account = accounts[0];
 simpleTicket.deployed().then(function(instance) {
 simpleTicketInstance = instance;
 return simpleTicketInstance.redeem(User).then(function(result){
     console.log(result)
     if(result==true){
       console.log('Ticket Activated')
     }
     else{
       console.log('Ticket Failed Miserably')
     }
   })
  })
})
}
 handleScan=(scan)=>{
   const contract = require('truffle-contract')
   const simpleTicket = contract(SimpleTicketContract)
   var simpleTicketInstance
   var that=this
     this.state.web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
     var key= scan.substring(0,3)
      simpleTicket.deployed().then(function(instance) {
      return simpleTicketInstance.listowner(key)
      .then(function(result) {
        console.log(result)
        var Acc=result[0]
        var hash=result[1]
        var final= that.state.web3.sha3(key+hash);
        console.log(Acc)
        console.log(hash)
        this.ReadSig(Acc,final,scan)

      })
    })
   })

 }
  setAmount=(event)=>{
      this.setState({amount:event.target.value})
      console.log(this.state.amount)
    }
  setNumber=(event)=>{
      this.setState({Number:event.target.value})
      }
  showScanner=(event)=>{
    const sc=this.state.showscanner;
    console.log(sc)
          this.setState({showscanner:!sc})
          }
  showBuy=()=>{
    console.log("click")
    const s=this.state.showbuy;
    console.log(s)
    this.setState({showbuy:!s})
          }
  showPrint=()=>{
    console.log("click")
    const sp=this.state.showprint;
    console.log(sp)
    this.setState({showprint:!sp})
      }
  showTicket=()=>{
    console.log("click")
    const st=this.state.showticket;
    console.log(st)
    this.setState({showticket:!st})
          }

  render() {
    let buy=null;
    let print=null;
    let ticketinfo=null;
    let ticketscanner=null;
    console.log(this.state.showbuy)
    if(this.state.showbuy){
    buy=
    (<div>
    <input type="text" class="form-control"  placeholder="Amount" onChange={this.setAmount}/>
    <button class="btn btn-primary" id="transferButton" type="button" onClick={this.handleTransfer}>Buy</button>
    </div>)
    };
    if(this.state.showprint){
    print=(
    <div>
      <button class="btn btn-primary"  type="button" onClick={this.printTicket}>Print</button>
      <input type="text"   placeholder="ticket number" id="PQ"/>
    </div>
    )

    }
    if(this.state.showticket){
    ticketinfo=(
      <div>

        <strong>Availble</strong>:{this.state.available} <span id="TTBalance"></span> <br/><br/>
         <strong>Cost In Ether</strong>:{this.state.cost} <span id="cost"></span> <br/><br/>
        <strong>MyTickets</strong>:{this.state.tickets} <span id="TTB"></span> <br/><br/>
      </div>
    )
   }
    if(this.state.showscanner){
    ticketscanner=(
    <div>
    <QReader ProcessScan={this.handleScan}></QReader>
    </div>)
    }
    console.log(ticketscanner)

    return (





      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-sm-8 col-sm-push-2">
            <h1 class="text-center">CryptoTicket</h1>
            <hr/>
            <br/>
          </div>
        </div>

        <div id="petsRow" class="row">
          <div class="col-sm-6 col-sm-push-3 col-md-4 col-md-push-4">
            <div class="panel panel-default">
              <div class="panel-heading">

              </div>
              <div class="panel-body">
                <h4 onClick={this.showTicket}>My Ticket Info</h4>
                {ticketinfo}
                <br/>
                <h4 onClick={this.showBuy}>Purchase Here</h4>
                {buy}
                <br/>
                <h4 onClick={this.showPrint}>Get Ticket Here</h4>
                {print}
              </div>


          { this.state.showqr==true ?
            <div >
          <QRCode value={this.state.qrCode} />
          </div> : null}
          <div>
            <br/>
          <button class="btn btn-primary" id="SB" type="button" onClick={this.showScanner}>Scan</button>
          {ticketscanner}
          </div>

      </div>
      </div>
    </div>
   </div>
    );
  }
}

export default App
