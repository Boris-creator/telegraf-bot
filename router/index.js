const { start, startScreen, authRedirect } = require('../controllers/baseController')
const { indexRegister, registerRedirectStep, registerStep, cancelRegister, backRegister, omitRegister,
  submitRegister } = require('../controllers/registerController')
const { indexLogin, handlerLogin } = require('../controllers/loginController')
const { indexClient, handlerClient, clientContactsIndex, clientContactsHandler, clientContactsChangeIndex,
  clientContactsChangeHandler } = require('../controllers/clientController')
const { indexAdmin, handlerAdmin, adminUnverifiedIndex, adminUnverifiedHandler,
  adminUnverifiedVerifyIndex, adminUnverifiedVerifyHandler, adminUnverifiedDeleteIndex,
  adminUnverifiedDeleteHandler } = require('../controllers/adminController')

const routes = [
  { path: "start", action: start },
  { path: "/start_screen",
    children: [
      { path: "", action: startScreen },
      { path: "/auth_redirect", action: authRedirect },
    ]
  },
  {
    path: "/form",
    children: [
      {
        path: "/register",
        children: [
          { path: '', action: indexRegister},
          { path: '/:title/message', action: registerRedirectStep },
          { path: '/:title', action: registerStep },
          { path: '/cancel', action: cancelRegister },
          { path: '/back', action: backRegister },
          { path: '/omit', omitRegister },
          { path: '/submit', submitRegister }
        ],
      },
      {
        path: "/login",
        children: [
          { path: '', action: indexLogin },
          { path: '/message', action: handlerLogin },
        ],
      },
    ],
  },
  {
    path: "/client",
    children: [
      { path: '', action: indexClient },
      { path: '/message', action: handlerClient },
      { path: '/contacts',
        children: [
          { path: '', action: clientContactsIndex },
          { path: '/message', action: clientContactsHandler },
          { path: '/change',
            children: [
              { path: '', action: clientContactsChangeIndex },
              { path: '/message', action: clientContactsChangeHandler }
            ]
          }
        ]
      }
    ],
  },
  {
    path: "/admin",
    children: [
      { path: '', action: indexAdmin  },
      { path: '/message', action: handlerAdmin },
      { path: '/unverified',
        children: [
          { path: '', action: adminUnverifiedIndex },
          { path: '/message', action: adminUnverifiedHandler },
          { path: '/verify',
            children: [
              { path: '', action: adminUnverifiedVerifyIndex },
              { path: '/message', action: adminUnverifiedVerifyHandler }
            ]
          },
          { path: '/delete',
            children: [
              { path: '', action: adminUnverifiedDeleteIndex },
              { path: '/message', action: adminUnverifiedDeleteHandler }
            ]
          }
        ]
      }
    ],
  },
]

module.exports = routes;
