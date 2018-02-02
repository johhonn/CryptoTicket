import React, { Component } from 'react'
import QrReader from 'react-qr-reader'

class QReader extends Component {
  constructor(props){
    super(props)
    this.state = {
      delay: 300,
      result: 'No result',
    }

  }

  handleError(err){
    console.error(err)
  }
  render(){
    return(
      <div>
        <QrReader
          delay={this.state.delay}
          onError={this.handleError}
          onScan={this.props.ProcessScan}
          style={{ width: '100%' }}
          />
        <p>{this.state.result}</p>
      </div>
    )
  }
}
export default QReader;
