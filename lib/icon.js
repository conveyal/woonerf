import React from 'react'

import Pure from './pure'

export default class Icon extends Pure {
  render () {
    const {className = '', type, ...props} = this.props
    return <i
      className={`fa fa-${type} fa-fw ${className}`}
      {...props}
      />
  }
}
