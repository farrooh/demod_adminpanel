"use client"

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Avatar, Box, Button, Divider, Grid, ListItemAvatar, Menu, MenuItem, Paper, styled } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import SimpleTypography from '../../../typography';
import { sampleInterior, sampleModel, sampleUser } from '@/data/samples';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Buttons from '@/components/buttons';
import Image from 'next/image';
import { ThemeProps } from '@/types/theme';
import { sampleComments } from '@/data/samples/sample_comments';
import { CommentSection } from '@/components/comment_section';
import { getOneInterior, selectOneInterior } from '../../../../data/get_one_interior';
import { selectMyProfile } from '../../../../data/me';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { IMAGES_BASE_URL } from '../../../../utils/image_src';
import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from 'next/link';
import EmptyData from '../../../views/empty_data';
import instance, { chatApi, setChatToken } from '../../../../utils/axios';
import Cookies from 'js-cookie';
import { selectComments } from '../../../../data/get_comments';
import formatComments, { CommentFormatInterface } from '../../../comment_section/format_comments';
import InteriorImages from '../../../views/interior/interior_images';
import InteriorImagesModal from '../../../views/interior/interior_images/images_modal';
import { ConfirmContextProps, resetConfirmData, resetConfirmProps, setConfirmProps, setConfirmState, setInteriorStatusChangeState, setLoginState, setOpenModal, setSelectedInterior } from '../../../../data/modal_checker';
import { toast } from 'react-toastify';
import { interiorStatuses } from '../../../../types/variables';
import { selectChatToken } from '../../../../data/get_chat_token';
import { setSelectedConversation } from '../../../../data/chat';
import { AppRegistration, DeleteForever, Edit, RateReview } from '@mui/icons-material';
import { getAllInteriors } from '../../../../data/get_all_interiors';
import { setRouteCrumbs } from '../../../../data/route_crumbs';

const DropDown = styled(Menu)(
  ({ theme }: ThemeProps) => `

  .MuiList-root{
    width:340px;
    max-height: 500px;
    overflow-x: auto;
    border: 1px solid #E0E0E0;
    padding: 8px;
  }

  .MuiPaper-root{
    border-radius:0 !important;
    box-shadow: 0px 7px 12px 0px #00000040;
  }
  `
);

export default function OneInterior() {
  const dispatch = useDispatch<any>()
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const pathname = usePathname()

  const isAuthenticated = useSelector((state: any) => state?.auth_slicer?.authState)
  const getInteriorStatus = useSelector((state: any) => state?.get_one_interior?.status)
  const getCommentsStatus = useSelector((state: any) => state?.get_comments?.status)
  const profile = useSelector(selectMyProfile);
  const commentsData = useSelector(selectComments);
  const [comments, setComments] = useState<CommentFormatInterface[]>([]);
  const [commentCurrentUser, setCommentUser] = useState<any>(null)

  const getInteriorsCategoryFilter = useSelector((state: any) => state?.handle_filters?.interiors_categories)
  const getInteriorsPageFilter = useSelector((state: any) => state?.handle_filters?.interiors_page)
  const getInteriorsNameFilter = useSelector((state: any) => state?.handle_filters?.interiors_name)
  const getInteriorsStatusFilter = useSelector((state: any) => state?.handle_filters?.interiors_status)
  const getInteriorsOrderBy = useSelector((state: any) => state?.handle_filters?.interiors_orderby)
  const getInteriorsOrder = useSelector((state: any) => state?.handle_filters?.interiors_order)

  const selectedInterior = useSelector((state: any) => state?.modal_checker?.selectedInterior)
  const interior = useSelector(selectOneInterior);
  const chatToken = useSelector(selectChatToken)
  const [status, setStatus] = useState<any>(selectedInterior?.status)
  const [showTags, setShowTags] = useState<any>(false)
  const interiorModels = interior?.used_models
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // React.useEffect(() => {
  //   if (getCommentsStatus == "succeeded" && commentsData) {
  //     setComments(formatComments(commentsData))
  //   }
  // }, [commentsData, getCommentsStatus])

  useEffect(() => {
    dispatch(setRouteCrumbs([{
      title: 'Интерьеры',
      route: '/interiors'
    }, {
      title: interior?.name,
      route: pathname
    }]))
  }, [])


  useMemo(() => {
    if (selectedInterior) {
      setStatus(selectedInterior?.status)
    }
  }, [selectedInterior])

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleStatusClick() {
    dispatch(setInteriorStatusChangeState(true))
    dispatch(setOpenModal(true))
  };

  async function handleCreateConversation() {

    setChatToken(Cookies.get('chatToken') || chatToken)

    chatApi.post(`/conversations`, {
      members: [interior?.author?.id]
    })
      .then(res => {
        dispatch(setSelectedConversation(res?.data?.id))
        router.refresh()
        router.push('/chat')
      })
  }

  function handleClickDelete() {
    const modalContent: ConfirmContextProps = {
      message: `Вы уверены, что хотите удалить интерьер «${interior?.name}»?`,
      actions: {
        on_click: {
          args: [interior?.id],
          func: async (checked: boolean, id: number) => {
            dispatch(setConfirmProps({ is_loading: true }))
            instance.delete(`interiors/${id}`)
              .then(res => {
                if (res?.data?.success) {
                  toast.success(res?.data?.message)
                  dispatch(getAllInteriors({
                    categories: getInteriorsCategoryFilter,
                    name: getInteriorsNameFilter,
                    status: getInteriorsStatusFilter,
                    page: getInteriorsPageFilter,
                    orderBy: getInteriorsOrderBy,
                    order: getInteriorsOrder,
                  }))
                  dispatch(setConfirmState(false))
                  dispatch(setOpenModal(false))
                  dispatch(resetConfirmProps())
                  dispatch(resetConfirmData())
                  router.refresh()
                  router.push('/interiors')
                }
                else {
                  toast.success(res?.data?.message)
                  dispatch(setConfirmProps({ is_loading: false }))
                }
              }).catch(err => {
                toast.error(err?.response?.data?.message)
                dispatch(setConfirmProps({ is_loading: false }))
              }).finally(() => {
                dispatch(setConfirmProps({ is_loading: false }))
              })
          }
        }
      }
    }
    dispatch(resetConfirmProps())
    dispatch(setConfirmProps(modalContent))
    dispatch(setConfirmState(true))
    dispatch(setOpenModal(true))
  }

  return (
    <Box sx={{ background: "#fafafa" }} className="products" >
      <Box className='products__container' sx={{ maxWidth: "1200px", width: "100%", margin: "0 auto !important", alignItems: "center", }}>
        <Grid container
          sx={{
            margin: '32px 0 40px 0',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <InteriorImagesModal mainImageWidth={800} />

          <DropDown
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >

            {
              interiorModels.length > 0
                ? interiorModels.map((e, i) => (
                  <MenuItem
                    key={i}
                    onClick={handleClose}
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        textDecoration: "none",
                        display: "flex",
                        width: '100%',
                        alignItems: "center",
                        justifyContent: 'space-between'
                      }}
                    >
                      <Link
                        href={`/models/${e?.model?.slug}`}
                        target='_blank'
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <SimpleTypography text={`${i + 1}`} sx={{ marginRight: '10px', fontWeight: 400, fontSize: '16px', lineHeight: '22px' }} />
                        <Image
                          src={`${e?.model?.cover[0]?.image?.src}`}
                          // src={`${IMAGES_BASE_URL}/${e?.model?.cover[0]?.image?.src}`}
                          alt="user icon"
                          width={80}
                          height={80}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            marginLeft: '10px'
                          }}
                        >
                          <SimpleTypography sx={{ marginLeft: '0px !important' }} className='drow-down__text' text={e?.model?.name} />
                          <SimpleTypography sx={{ marginLeft: '0px !important' }} className='drow-down__text' text={`${e?.model?.style?.name}, ${e?.model?.brand?.name}`} />
                        </Box>
                      </Link>
                      {
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingLeft: '10px',
                            borderLeft: '1.6px solid #E0E0E0'
                          }}
                        >
                          <Buttons className='delete__tag'>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1.66634 4.33398H12.333V13.0007C12.333 13.1775 12.2628 13.347 12.1377 13.4721C12.0127 13.5971 11.8432 13.6673 11.6663 13.6673H2.33301C2.1562 13.6673 1.98663 13.5971 1.8616 13.4721C1.73658 13.347 1.66634 13.1775 1.66634 13.0007V4.33398ZM2.99967 5.66732V12.334H10.9997V5.66732H2.99967ZM4.99967 7.00065H6.33301V11.0007H4.99967V7.00065ZM7.66634 7.00065H8.99967V11.0007H7.66634V7.00065ZM3.66634 2.33398V1.00065C3.66634 0.82384 3.73658 0.654271 3.8616 0.529246C3.98663 0.404222 4.1562 0.333984 4.33301 0.333984H9.66634C9.84315 0.333984 10.0127 0.404222 10.1377 0.529246C10.2628 0.654271 10.333 0.82384 10.333 1.00065V2.33398H13.6663V3.66732H0.333008V2.33398H3.66634ZM4.99967 1.66732V2.33398H8.99967V1.66732H4.99967Z" fill="#686868" />
                            </svg>
                          </Buttons>
                        </Box>
                      }

                    </Box>
                  </MenuItem>
                ))
                : <EmptyData boxShadow={false} border={false} />
            }

          </DropDown>

          <Grid item
            sx={{
              minWidth: '520px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}
          >
            <Link href={`/users/${interior?.author?.username}`}>
              <ListItemAvatar
                sx={{
                  backgroundColor: '#fff',
                  width: '72px',
                  height: '72px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '50%',
                }}
              >
                <Avatar
                  src={interior?.author?.image_src ? `${IMAGES_BASE_URL}/${interior?.author?.image_src}` : '/img/avatar.png'}
                  alt='User image'
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%'
                  }}
                />
              </ListItemAvatar>
            </Link>
            <Link href={`/users/${interior?.author?.username}`}>
              <Box sx={{ marginLeft: '24px' }}>
                <SimpleTypography
                  text={interior?.author?.username}
                  sx={{
                    fontSize: '22px',
                    fontWeight: 400,
                    lineHeight: '26px',
                    letterSpacing: '-0.02em',
                    textAlign: 'start',
                    color: '#141414'
                  }}
                />

                <SimpleTypography
                  text={interior?.author?.full_name}
                  sx={{
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    letterSpacing: '-0.01em',
                    textAlign: 'start',
                    color: '#848484'
                  }}
                />
              </Box>
            </Link>
            <Box sx={{ marginLeft: '24px' }}>
              <Buttons
                onClick={() => handleCreateConversation()}
                sx={{ padding: '10px !important', m: '0 !important' }}
                className='signIn__btn btn'
                name="Написать"
                childrenFirst={true}
              >
                <RateReview sx={{ width: '20px', height: '20px', mr: '8px' }} />
              </Buttons>
            </Box>
          </Grid>

          <Grid item
            sx={{
              minWidth: '480px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            <Box margin={'0 0 0 16px'}>
              <Buttons
                id="basic-menu"
                aria-controls={'basic-menu'}
                aria-haspopup="true"
                aria-expanded={true}
                onClick={handleClick}
                sx={{ padding: "0 3px ", display: "flex", "&:hover": { background: "#F5F5F5" } }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SimpleTypography
                    text={`Бирки (${interiorModels.length})`}
                    sx={open ? { color: "#7210BE !important" } : {}}
                    className={''}
                  />
                  <KeyboardArrowDownIcon
                    sx={!open ? { minWidth: "11px", minHeight: "7px", color: "black" } : { minWidth: "11px", minHeight: "7px", color: "#7210BE", transform: "rotateZ(180deg)", transitionDuration: "1000ms" }}
                  />
                </Box>
              </Buttons>
            </Box>
            <Box margin={'0 0 0 16px'}>
              <Buttons
                name={`${showTags ? 'Скрыть' : 'Показать'} бирки`}
                onClick={() => setShowTags(!showTags)}
                className='bookmark__btn'
                childrenFirst
              >
                <Image
                  alt='hide'
                  width={18}
                  height={18}
                  src={'/icons/hide-icon.svg'}
                />
              </Buttons>
            </Box>
            <Box margin={'0 0 0 16px'}>
              <Buttons
                name={interiorStatuses?.[status]?.text}
                onClick={handleStatusClick}
                className='bookmark__btn'
                childrenFirst
                sx={{
                  color: `${interiorStatuses?.[status]?.color} !important`,
                  borderColor: `${interiorStatuses?.[status]?.color} !important`,
                  bgcolor: `${interiorStatuses?.[status]?.bgcolor} !important`,
                }}
              >
                <Edit sx={{ mr: '8px', width: '20px', height: '20px' }} />
              </Buttons>
            </Box>
            <Box margin={'0 0 0 16px'}>
              <Buttons
                name="Удалить"
                onClick={handleClickDelete}
                sx={{ padding: '10px !important' }}
                className='red_outlined__btn btn'
                childrenFirst
              >
                <DeleteForever sx={{ width: '20px', height: '20px', mr: '8px' }} />
              </Buttons>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ width: '100%', minHeight: '1200px' }}>
          <InteriorImages />
        </Box>

        <Box sx={{ width: '100%' }}>
          <SimpleTypography
            text={interior?.name}
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: '26px',
              lineHeight: '37.7px',
              marginBottom: '24px'
            }}
          />

          {
            interiorModels && interiorModels?.length > 0
              ? <Box sx={{ width: '100%' }}>
                <SimpleTypography
                  text='Использованные 3D модели:'
                  variant="h3"
                  sx={{
                    fontWeight: 400,
                    fontSize: '22px',
                    lineHeight: '31.9px',
                    letterSpacing: '-0.02em'
                  }}
                />
                {
                  interiorModels?.map((i, n) => (
                    <Box key={n} sx={{ width: '100%' }}>
                      <SimpleTypography
                        text={`${n + 1}. ${i?.model?.name}`}
                        sx={{
                          fontWeight: 400,
                          fontSize: '22px',
                          lineHeight: '31.9px',
                          letterSpacing: '-0.02em'
                        }}
                      />
                    </Box>
                  ))
                }
              </Box>
              : null
          }
        </Box>

        {/* <Divider sx={{ margin: '40px 0' }} />

        <Box sx={{ width: '100%' }}>

          <CommentSection
            titleStyle={{
              fontWeight: 500,
              fontSize: '30px',
              lineHeight: '36px',
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}
            currentUser={commentCurrentUser}
            advancedInput={false}
            logIn={{
              loginLink: 'http://localhost:3001/',
              signupLink: 'http://localhost:3001/'
            }}
            commentData={comments}
            onSubmitAction={
              (data, context) => {
                instance.post(
                  '/comments',
                  {
                    text: data.text,
                    entity_source: 'interior',
                    entity_id: interior?.id,
                  }
                ).then(async res => {
                  const com = res.data?.data?.comment
                  await context.onSubmit(com.text, com.id, com.created_at)
                }).catch(err => {
                  alert('Something went wrong! Try again later')
                })
              }}
            onReplyAction={
              (data, context) => {
                instance.post(
                  '/comments',
                  {
                    text: data.text,
                    parent_id: data.repliedToCommentId,
                    entity_source: 'interior',
                    entity_id: interior?.id,
                  }
                ).then(async res => {
                  const com = res.data?.data?.comment
                  await context.onReply(com.text, com.id, com.parent_id, com.id, com.created_at)
                }).catch(err => {
                  alert('Something went wrong! Try again later')
                })
              }
            }
            currentData={(data: any) => {
              console.log('curent data', data)
            }}
            removeEmoji={true}
          />
        </Box> */}
      </Box>
    </Box>
  )
}