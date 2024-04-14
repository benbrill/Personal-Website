import PropTypes from 'prop-types'
import React from 'react'
import { Flap } from './Flap'
import './styles.css' as styles

export const FlapDigit = ({
  className,
  css,
  value,
  prevValue,
  final,
  mode,
  ...restProps
}) => {
  console.log(styles)
  return (
    <div className={styles.digit} data-kind='digit' data-mode={mode}>
      <Flap {...restProps}>{value}</Flap>
      <Flap bottom {...restProps}>{prevValue}</Flap>
      <Flap key={`top-${prevValue}`} animated final={final} {...restProps}>{prevValue}</Flap>
      {final && <Flap key={`bottom-${value}`} bottom animated final {...restProps}>{value}</Flap>}
    </div>
  )
}

FlapDigit.defaultProps = {
  value: '',
  prevValue: '',
  final: false,
  mode: null
}

FlapDigit.propTypes = {
  mode: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.string,
  prevValue: PropTypes.string,
  final: PropTypes.bool
}
