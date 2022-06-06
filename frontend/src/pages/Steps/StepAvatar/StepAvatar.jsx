import React, { useEffect, useState } from "react";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import styles from "./StepAvatar.module.css";
import { useSelector, useDispatch } from "react-redux";
import { setAvatar } from "../../../store/activateSlice";
import { setAuth } from "../../../store/authSlice";
import { activate } from "../../../http";
import Loader from "../../../components/shared/Loader/Loader";

const StepAvatar = ({ onNext }) => {
  const { name, avatar } = useSelector((state) => state.activate);
  const [image, setImage] = useState("/images/monkey-avatar.png");
  const [loading, setLoading] = useState(false);
  const [unMounted, setUnMounted] = useState(false);

  const dispatch = useDispatch();

  function captureImage(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = function () {
      setImage(reader.result);
      dispatch(setAvatar(reader.result));
      console.log(reader.result);
    };
  }

  async function submit() {
    if (!name || !avatar) return;
    setLoading(true);
    try {
      const { data } = await activate({ name, avatar });

      if (data.auth) {
        if (!unMounted) {
          dispatch(setAuth(data));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      setUnMounted(true);
    };
  }, []);

  if (loading) {
    return <Loader message="Activation in Progress" />;
  }

  return (
    <>
      <Card title={`Hello , ${name} `} icon="monkey-emoji">
        <p className={styles.subHeading}>How's this photo</p>

        <div className={styles.avatarWrapper}>
          <img className={styles.avatarImage} src={image} alt="avatar" />
        </div>

        <div>
          <input
            id="avatarInput"
            type="file"
            className={styles.avatarInput}
            onChange={captureImage}
          />
          <label className={styles.avatarLabel} htmlFor="avatarInput">
            Choose a Another Photo
          </label>
        </div>
        <div>
          <Button onClick={submit} text="Next" />
        </div>
      </Card>
    </>
  );
};

export default StepAvatar;
