import { Box, Grid, Skeleton, SxProps } from "@mui/material";
import SimpleTypography from "../../typography";
import { useRouter } from 'next/navigation'
import Link from "next/link";

interface Props {
  data: {
    name: string;
    count: string | number;
    secondary_text?: string;
    link?: string;
  }[];
  sx?: SxProps;
  mainColor?: string;
  fullWidth?: boolean;
  fillWidth?: boolean;
  loading?: boolean;
}

export default function CountsGrid({ data, sx, loading, fullWidth, fillWidth, mainColor }: Props) {

  const fakeData = Array.from({ length: 6 })
  const router = useRouter()

  return (
    <Grid container
      gap={2}
      sx={{
        width: '100%',
        ...sx
      }}
    >
      {
        !loading ?
          data.map((elem, ind) => (
            <Grid item
              xs={fullWidth ? 12 : fillWidth}
              lg={fullWidth ? 12 : fillWidth}
              md={fullWidth ? 12 : fillWidth}
              sm={fullWidth ? 12 : fillWidth}
              key={ind}
              sx={{
                position: 'relative',
                p: '20px 24px',
                bgcolor: '#fff',
                boxShadow: '0px 3px 4px 0px #00000014',
                borderRadius: '4px',
              }}
            >
              <Link href={elem?.link || ''}
                style={{
                  position: 'absolute',
                  top: 0, bottom: 0, right: 0, left: 0,
                }}
              />
              <Box
                sx={{
                  width: '100%',
                }}
              >
                <SimpleTypography
                  text={elem?.name}
                />
                <SimpleTypography
                  sx={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: mainColor || '#454545'
                  }}
                  text={`${elem?.count || 0}`}
                />
                {
                  elem?.secondary_text && (
                    <SimpleTypography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 400,
                      }}
                      text={elem.secondary_text}
                    />
                  )
                }
              </Box>
            </Grid>
          ))
          :
          fakeData.map((elem, ind) => (
            <Grid
              xs={fullWidth ? 12 : fillWidth}
              lg={fullWidth ? 12 : fillWidth}
              md={fullWidth ? 12 : fillWidth}
              sm={fullWidth ? 12 : fillWidth}
              key={ind}
              sx={{
                p: '24px',
                bgcolor: '#fff',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                }}
              >
                <Skeleton
                  variant='rectangular'
                  width='80px'
                  height='20px'
                />
                <Skeleton
                  sx={{ mt: '8px' }}
                  variant='rectangular'
                  width='40px'
                  height='40px'
                />
              </Box>
            </Grid>
          ))
      }
    </Grid>
  )
}