import isEqual from 'lodash/isEqual'
import {Component} from 'react'

export default class Pure extends Component {
  shouldComponentUpdate (newProps, newState) {
    return !isEqual(newProps, this.props) || !isEqual(newState, this.state)
  }
}
