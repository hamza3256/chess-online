import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Joi from "joi";
import {
  loginProcessThunk,
  changeField,
  clearField,
  clearSpecificField,
} from "../../modules/sessionAuth";
import Login from "../../components/login/Login";

import { useNavigate } from "react-router";
export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const history = useNavigate();
    return <Component history={history} {...props} />;
  };
  return Wrapper;
};

const LoginContainer = ({ history }) => {
  const { form, auth, authError } = useSelector(({ sessionAuth }) => ({
    form: sessionAuth.login,
    auth: sessionAuth.auth,
    authError: sessionAuth.authError,
  }));

  const dispatch = useDispatch();

  const [error, setError] = useState({
    username: "",
    password: "",
  });

  const onChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (error[name] !== "") {
        setError((prevState) => ({
          ...prevState,
          [name]: "",
        }));
      }
      dispatch(
        changeField({
          form: "login",
          key: name,
          value,
        })
      );
    },
    [dispatch, error]
  );

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const { username, password } = form;

      //  initialize
      let nextError = Object.keys(form).reduce(
        (acc, key) => ({
          ...acc,
          [key]: false,
        }),
        {}
      );

      //  empty check
      Object.keys(nextError)
        .filter((key) => form[key] === "")
        .forEach((key) => {
          nextError = {
            ...nextError,
            [key]: "Required field",
          };
        });

      const schema = Joi.object().keys({
        username: Joi.string()
          .max(80)
          .email({ minDomainAtoms: 2 })
          .required()
          .error(() => ({ message: "Wrong format" })),
        password: Joi.string()
          .min(4)
          .max(16)
          .required()
          .error(() => ({ message: "4 ~ 16 digits" })),
      });

      const result = Joi.validate(form, schema, { abortEarly: false });

      if (result.error) {
        result.error.details.forEach((detail) => {
          if (!nextError[detail.path[0]]) {
            nextError = {
              ...nextError,
              [detail.path[0]]: detail.message,
            };
          }
        });
      }

      if (Object.keys(nextError).filter((key) => nextError[key]).length > 0) {
        setError((prevState) => ({
          ...nextError,
          count: prevState.count + 1,
        }));
        Object.keys(nextError).forEach((key) => {
          if (nextError[key]) {
            dispatch(clearSpecificField({ form: "login", key }));
          }
        });

        return;
      }

      dispatch(loginProcessThunk({ username, password }));
      dispatch(clearField({ form: "login" }));
    },
    [dispatch, form]
  );

  useEffect(() => {
    if (authError) {
      let nextError = {};
      const errorMention = authError.response.data;
      Object.keys(errorMention).forEach((key) => {
        nextError = {
          ...nextError,
          [key]: errorMention[key],
        };
        // dispatch(clearSpecificField({ form: 'login', key }))
      });

      setError(nextError);

      return;
    }

    if (auth) {
      history.push("/");
    }
  }, [history, auth, authError]);

  useEffect(() => {
    return () => {
      dispatch(clearField({ form: "login" }));
    };
  }, [dispatch]);

  const onRegister = useCallback(() => {
    dispatch(clearField({ form: "register" }));
    history.push("/register");
  }, [dispatch, history]);

  return (
    <Login
      login
      onSubmit={onSubmit}
      onChange={onChange}
      form={form}
      error={error}
      onRegister={onRegister}
    />
  );
};

export default withRouter(LoginContainer);
