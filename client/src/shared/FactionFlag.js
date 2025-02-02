import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

import * as factions from '../gameInfo/factions'

import { usePlasticColors } from './plasticColors'

const useFlagStyles = makeStyles({
  root: {
    width: ({ width }) => `calc(${width} - 2px)`,
    height: ({ height }) => `calc(${height} - 2px)`,
    backgroundColor: ({ selected }) =>
      `rgba(255, 255, 255, ${selected ? '0.9' : '0.3'})`,
    borderRadius: '7%',
    cursor: ({ disabled }) => (disabled ? 'default' : 'pointer'),
    display: 'flex',
    justifyContent: 'center',
    border: ({ plasticColor }) =>
      plasticColor ? `2px solid ${plasticColor}` : '',
    margin: '1px 1px',
  },
  factionImage: {
    opacity: ({ selected }) => (selected ? 1 : 0.6),
    height: '100%',
    width: 'auto',
    backgroundSize: 'contain',
    backgroundRepeat: 'none',
  },
})

function FactionFlag(
  { disabled, factionKey, selected, onClick, width, height, className },
  ref,
) {
  const { t } = useTranslation()
  const plasticColors = usePlasticColors()
  const plasticColor = plasticColors[factionKey]
  const classes = useFlagStyles({
    selected,
    width,
    height,
    disabled,
    plasticColor: plasticColor?.hex,
  })
  const factionData = factions.getData(factionKey)

  return (
    <div
      ref={ref}
      className={clsx(classes.root, className)}
      onClick={disabled ? undefined : onClick}
    >
      <img
        alt={factionKey}
        className={classes.factionImage}
        src={factionData.image}
        title={`${t(`factions.${factionKey}.name`)} ${
          plasticColor
            ? `(${t(`general.labels.colors.${plasticColor.color}`)})`
            : ''
        }`}
      />
    </div>
  )
}

export default React.forwardRef(FactionFlag)
