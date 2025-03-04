import * as React from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import Image from 'next/image'
import { Grid } from '@mui/material';
import { style } from './basic_modal'

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid sx={{ display: "flex", alignItems: "start" }}>
            <Box sx={{ minWidth: "35px", mr: "5px", mt: "7px" }}>
              <Image
                src="/../../icons/error-warning-line.svg"
                alt="Picture of the author"
                width={35}
                height={35}
              />
            </Box>
            <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
              <Typography id="modal-modal-title" variant="h6" sx={{ fontSize: "30px", fontWeight: "500" }} component="h2">
                Text in a modal
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}
