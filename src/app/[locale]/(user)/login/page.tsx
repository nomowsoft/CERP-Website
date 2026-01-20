import LoginForm from "./loginform";

const LoginPage = () => {
  return (
    <section className="fix-height container m-auto px-7 flex items-center justify-center">
      <div className="m-auto bg-white rounded-lg p-5 w-full md:w-2/3">
        <LoginForm />
      </div>
    </section>
  )
}

export default LoginPage