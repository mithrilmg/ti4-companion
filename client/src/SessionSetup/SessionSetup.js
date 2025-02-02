import { useMemo, useState, useCallback } from 'react'
import { Container } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { useHistory, useRouteMatch, generatePath } from 'react-router-dom'

import { useDispatch } from '../state'
import { Tab, Tabs } from '../components/navigation'

import { SetFactions } from './SetFactions'
import { DraftSetup } from './DraftSetup'

const VIEW = {
  simpleSetup: 'simpleSetup',
  setupDraft: 'setupDraft',
}

export function SessionSetup() {
  // const [view, setView] = useState(VIEW.simpleSetup)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const draftSetupRoute = useRouteMatch('/new/draft')
  const view = useMemo(() => {
    if (draftSetupRoute?.isExact) {
      return VIEW.setupDraft
    }

    return VIEW.simpleSetup
  }, [draftSetupRoute])
  const history = useHistory()
  const go = useMemo(
    () => ({
      [VIEW.simpleSetup]: () => history.push('/new/factions'),
      [VIEW.setupDraft]: () => history.push('/new/draft'),
    }),
    [history],
  )
  const handleViewChange = useCallback((_event, newView) => go[newView](), [go])

  const renderView = useCallback(() => {
    switch (view) {
      case VIEW.simpleSetup:
        return <SetFactions dispatch={dispatch} />
      case VIEW.setupDraft:
        return <DraftSetup />
      default:
        return null
    }
  }, [view, dispatch])

  return (
    <>
      <Tabs onChange={handleViewChange} value={view}>
        <Tab
          label={t('sessionSetup.tabs.simple')}
          title={t('sessionSetup.tabs.simple')}
          value={VIEW.simpleSetup}
        />
        <Tab
          label={t('sessionSetup.tabs.draft')}
          title={t('sessionSetup.tabs.draft')}
          value={VIEW.setupDraft}
        />
      </Tabs>
      <Container style={{ marginTop: '4em' }}>{renderView()}</Container>
    </>
  )
}
