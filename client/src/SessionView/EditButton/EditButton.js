import { useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Edit } from '@material-ui/icons'

import { useSessionContext } from '../SessionProvider'

import { EditPasswordDialog } from './EditPasswordDialog'

const useStyles = makeStyles({
  button: {
    color: 'white',
  },
})

function ConfirmationDialog(props) {
  const { onClose, onCancel, title, message, onConfirm, open, ...other } = props

  const handleCancel = () => {
    onCancel()
  }

  const handleOk = () => {
    onConfirm()
  }

  return (
    <Dialog
      aria-labelledby="confirmation-dialog-title"
      maxWidth="xs"
      open={open}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button autoFocus color="secondary" onClick={handleCancel}>
          <Trans i18nKey="general.labels.cancel" />
        </Button>
        <Button color="white" onClick={handleOk}>
          <Trans i18nKey="general.labels.ok" />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function EditButton() {
  const { t } = useTranslation()
  const classes = useStyles()
  const { editable, disableEdit } = useSessionContext()

  const [confirmationOpen, setEditCancelConfirmationOpen] = useState()
  const onDisableEditConfirmation = useCallback(() => {
    disableEdit()
    setEditCancelConfirmationOpen(false)
  }, [disableEdit])

  const [editPasswordOpen, setEditPasswordOpen] = useState()

  const onClose = useCallback(() => {
    setEditCancelConfirmationOpen(false)
    setEditPasswordOpen(false)
  }, [])
  const handleClick = useCallback(() => {
    if (editable) {
      setEditCancelConfirmationOpen(true)

      return
    }

    setEditPasswordOpen(true)
  }, [editable])

  return (
    <>
      <Tooltip
        placement="bottom"
        title={
          editable
            ? t('editProtection.enableEdit.cancelEdit.tooltip')
            : t('editProtection.enableEdit.tooltip')
        }
      >
        <IconButton
          aria-label={t('editProtection.enableEdit.tooltip')}
          className={classes.button}
          onClick={handleClick}
        >
          <Edit color={editable ? 'secondary' : ''} />
        </IconButton>
      </Tooltip>
      <ConfirmationDialog
        keepMounted
        message={t('editProtection.enableEdit.cancelEdit.prompt')}
        onCancel={onClose}
        onConfirm={onDisableEditConfirmation}
        open={confirmationOpen}
        title={t('editProtection.enableEdit.cancelEdit.title')}
      />
      <EditPasswordDialog onClose={onClose} open={editPasswordOpen} />
    </>
  )
}
