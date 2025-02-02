import { Helmet } from 'react-helmet'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Route, Switch } from 'react-router-dom'

import * as factions from '../gameInfo/factions'
import { getFactionCheatSheetPath } from '../gameInfo/factions'
import { FullscreenButton, HideInFullscreen } from '../Fullscreen'
import { SESSION_VIEW_ROUTES } from '../shared/constants'
import { TogglePlasticColorsButton } from '../shared/plasticColors'

import useRealTimeSession from './useRealTimeSession'
import { Overview } from './Overview'
import ShareButton from './ShareButton'
import { EditButton } from './EditButton'
import Map from './Map'
import SessionNavigation from './SessionNavigation'
import DetailsForm from './DetailsForm'
import LockForEdit from './LockForEdit'
import { Timeline } from './Timeline'

const useStyles = makeStyles({
  header: {
    marginBottom: '2em',
  },
})

export function SessionView({
  sessionService,
  editable,
  session,
  updateFactionPoints,
}) {
  useRealTimeSession(session.id)
  const classes = useStyles()

  const sortedPoints = [...session.points]
  sortedPoints.sort((a, b) => b.points - a.points)
  const winningFaction = sortedPoints[0]?.faction

  // TODO draft title etc
  return (
    <>
      <Helmet>
        <title>{`TI4 Companion session- ${session.factions.length} players - 10VP`}</title>
        <meta
          content={sortedPoints
            .map(
              ({ faction, points }) =>
                `${factions.getData(faction).name}(${points}vp)`,
            )
            .join(', ')}
          name="description"
        />

        <meta
          content={`TI4 Companion session - ${session.factions.length} players - 10VP`}
          property="og:title"
        />
        <meta
          content={sortedPoints
            .map(
              ({ faction, points }) =>
                `${factions.getData(faction).name}(${points}vp)`,
            )
            .join(', ')}
          property="og:description"
        />
        {winningFaction && (
          <meta
            content={`${window.location.origin}${getFactionCheatSheetPath(
              winningFaction,
            )}`}
            property="og:image"
          />
        )}
      </Helmet>

      <HideInFullscreen>
        <Grid className={classes.header} container>
          <Grid item sm={8} xs={4}>
            <SessionNavigation />
          </Grid>
          <Grid container item justifyContent="flex-end" sm={4} xs={8}>
            <EditButton />
            <TogglePlasticColorsButton />
            <FullscreenButton />
            <ShareButton session={session} />
          </Grid>
        </Grid>
      </HideInFullscreen>

      <LockForEdit session={session} />

      <Switch>
        <Route exact path={SESSION_VIEW_ROUTES.map}>
          <Map
            editable={editable}
            session={session}
            sessionService={sessionService}
          />
        </Route>
        <Route exact path={SESSION_VIEW_ROUTES.details}>
          <DetailsForm disabled={!editable} session={session} />
        </Route>
        <Route exact path={SESSION_VIEW_ROUTES.timeline}>
          <Timeline
            editable={editable}
            session={session}
            sessionService={sessionService}
          />
        </Route>
        <Route exact path={SESSION_VIEW_ROUTES.main}>
          <Overview
            editable={editable}
            session={session}
            sessionService={sessionService}
            updateFactionPoints={updateFactionPoints}
          />
        </Route>
      </Switch>
    </>
  )
}
