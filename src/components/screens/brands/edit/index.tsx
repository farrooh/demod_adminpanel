"use client"

import React, { useMemo, useState } from 'react'
import { Box, Grid } from '@mui/material';
import { AddBrandForm } from '../../../views/brand/add_brand_form';
import { setRouteCrumbs } from '../../../../data/route_crumbs';
import { useDispatch, useSelector } from '../../../../store';
import { selectOneBrand } from '../../../../data/get_one_brand';

export default function EditBrand() {
  const brand = useSelector(selectOneBrand)

  return (
    <Box className='products__container' sx={{ maxWidth: "1268px", width: "100%", margin: "0 auto !important", alignItems: "center", }}>
      <Grid
        container
        display={'flex'}
        alignItems={'flex-start'}
        justifyContent={'center'}
        width={'608px'}
        m={'32px 0'}
      >
        <Grid item width={'100%'}>
          <AddBrandForm editing brand={brand} />
        </Grid>
      </Grid>
    </Box>
  )
}