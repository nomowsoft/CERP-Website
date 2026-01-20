import RegisterForm from "./RegisterForm";

const RegisterPage = () => {
  return (
    <section className="fix-height container m-auto px-7 flex items-center justify-center">
      <div className="m-auto bg-white rounded-lg p-5 w-full md:w-2/3">
        <RegisterForm />
      </div>
    </section>
  )
}

export default RegisterPage