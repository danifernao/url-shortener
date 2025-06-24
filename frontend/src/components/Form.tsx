import Tooltip from "./Tooltip";
import ReCAPTCHA from "react-google-recaptcha";
import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ApiResp {
  hasErrors: boolean;
  shortUrl: string | null;
  message: string | { [key: string]: string } | null;
}

function Form() {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const reCaptchaRef = useRef<any>(null);
  const [apiResp, setApiResp] = useState<ApiResp>({
    hasErrors: false,
    shortUrl: null,
    message: null,
  });
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [shouldRenderCaptcha, setShouldRenderCaptcha] =
    useState<boolean>(false);
  const reCaptchaSiteKey: string = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const submitForm = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const apiUrl = "http://localhost/api/";
    const formData = new FormData(formRef.current!);

    let hasErrors: boolean = false;
    let shortUrl: string | null = null;
    let message: string | { [key: string]: string } | null = null;

    formRef.current!.url.disabled = true;
    formRef.current!.alias.disabled = true;
    formRef.current!.btn.disabled = true;

    if (!formRef.current!.alias) {
      formData.delete("alias");
    }

    if (reCaptchaSiteKey) {
      formData.append("g-recaptcha-response", reCaptchaRef.current.getValue());
    }

    fetch(apiUrl, {
      method: "post",
      body: formData,
    })
      .then((response) => {
        hasErrors = !response.ok;
        return response.json();
      })
      .then((json) => {
        shortUrl = json.alias
          ? `${location.protocol}//${location.hostname}/${json.alias}`
          : null;
        message = json.message || null;
      })
      .catch((_) => {
        hasErrors = true;
      })
      .finally(() => {
        setApiResp({
          hasErrors: hasErrors,
          shortUrl: shortUrl,
          message: message,
        });

        formRef.current!.url.disabled = false;
        formRef.current!.alias.disabled = false;
        formRef.current!.btn.disabled = false;

        if (reCaptchaSiteKey && !shortUrl) {
          reCaptchaRef.current.reset();
        }
      });

    event.preventDefault();
  };

  const resetForm = (event: React.MouseEvent<HTMLButtonElement>): void => {
    formRef.current!.url.value = "";
    setApiResp({ hasErrors: false, shortUrl: null, message: null });
    setShouldRenderCaptcha(true);
    event.preventDefault();
  };

  const hasErrorMessage = (key: string): boolean => {
    return !!(
      apiResp.hasErrors &&
      apiResp.message &&
      typeof apiResp.message === "object" &&
      key in apiResp.message
    );
  };

  useEffect(() => {
    if (reCaptchaSiteKey && shouldRenderCaptcha) {
      reCaptchaRef.current.reset();
      setShouldRenderCaptcha(false);
    }
  }, [shouldRenderCaptcha]);

  const copyThis = async (event: React.MouseEvent<HTMLInputElement>) => {
    const inputElem = event.currentTarget;
    try {
      inputElem.select();
      await navigator.clipboard.writeText(inputElem.value);
      setIsTooltipVisible(true);
    } catch {}
  };

  return (
    <form ref={formRef}>
      {apiResp.hasErrors &&
        (!apiResp.message || typeof apiResp.message === "string") && (
          <div className="alert error">
            {apiResp.message ||
              "Error inesperado. Por favor, inténtelo más tarde."}
          </div>
        )}

      <div className="field">
        <label htmlFor={`url-${id}`}>
          <FontAwesomeIcon icon="link" aria-hidden="true" />
          {apiResp.shortUrl ? "Tu URL larga" : "Acortar una URL larga"}:
        </label>

        <input
          id={`url-${id}`}
          name="url"
          type="text"
          placeholder="Ingresa aquí la URL"
          readOnly={!!apiResp.shortUrl}
        />

        {hasErrorMessage("url") && (
          <div id={`url-${id}-error`} className="error">
            {typeof apiResp.message === "object" && apiResp.message!.url}
          </div>
        )}
      </div>

      <div className="field">
        {apiResp.shortUrl ? (
          <>
            <label htmlFor={`short-url-${id}`}>
              <FontAwesomeIcon icon="wand-magic-sparkles" aria-hidden="true" />
              Tu URL acortada:
            </label>

            <input
              id={`short-url-${id}`}
              type="text"
              value={apiResp.shortUrl}
              onClick={copyThis}
              onBlur={() => setIsTooltipVisible(false)}
              aria-describedby={`short-url-${id}-tooltip`}
              readOnly
            />

            <Tooltip isVisible={isTooltipVisible} sourceId={`short-url-${id}`}>
              ¡Enlace copiado!
            </Tooltip>
          </>
        ) : (
          <>
            <label htmlFor={`alias-${id}`}>
              <FontAwesomeIcon icon="wand-magic-sparkles" aria-hidden="true" />
              Personaliza tu enlace:
            </label>

            <div className="alias">
              <div className="hostname">
                {location.protocol}//{location.hostname}/
              </div>
              <input
                id={`alias-${id}`}
                name="alias"
                type="text"
                placeholder="Ingresa aquí el alias"
              />
            </div>

            {hasErrorMessage("alias") && (
              <div id={`alias-${id}-error`} className="error">
                {typeof apiResp.message === "object" && apiResp.message!.alias}
              </div>
            )}
          </>
        )}
      </div>

      {reCaptchaSiteKey && !apiResp.shortUrl && (
        <div className="field captcha">
          <ReCAPTCHA ref={reCaptchaRef} sitekey={reCaptchaSiteKey} />
          {hasErrorMessage("recaptcha") && (
            <div id={`recaptcha-${id}-error`} className="error">
              {typeof apiResp.message === "object" &&
                apiResp.message!.recaptcha}
            </div>
          )}
        </div>
      )}

      {apiResp.shortUrl ? (
        <button onClick={resetForm}>Acortar otra URL</button>
      ) : (
        <button name="btn" onClick={submitForm}>
          Acortar URL
        </button>
      )}
    </form>
  );
}

export default Form;
