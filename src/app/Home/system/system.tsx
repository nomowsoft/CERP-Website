import SystemHalaqat from "./system_halaqat";
import SystemHealth from "./system_health";

const System = () => {
  return (
    <section className="py-32 bg-system bg-cover bg-no-repeat bg-white">
        <div data-aos="zoom-in">
            <h1 className="text-5xl font-bold text-center text-success">
                أنظمة سرب
            </h1>
        </div>
        <SystemHealth />
        <SystemHalaqat />
    </section>
  );
}

export default System