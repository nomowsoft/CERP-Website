interface FormInputProps {
  label: string;
  type: string;
  id: string;
  placeholder: string;
  required?: boolean;  // `required` should be a boolean or undefined
}
const FormInput = ({ label, type, id, placeholder, required = false, ...props }: FormInputProps) => (
  <div className="w-full">
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-success">{label}</label>
    <input
      type={type}
      id={id}
      className="bg-slate-100 border border-success text-success text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
      placeholder={placeholder}
      required={required}  // Ensure `required` is a boolean here
      {...props}
    />
  </div>
);

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  id: string;
  options: Option[];  // options is an array of objects with value and label properties
  defaultValue: string;
}

const FormSelect = ({ label, id, options, defaultValue }: FormSelectProps) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-success">{label}</label>
    <select
      id={id}
      defaultValue={defaultValue}
      className="bg-slate-100 border border-success text-success text-sm rounded-lg focus:ring-success focus:border-success block w-full p-1.5"
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

interface FormTextareaProps {
  label: string;
  id: string;
  placeholder: string;
  rows: number;
  required?: boolean;
}

const FormTextarea = ({ label, id, placeholder, rows, required = false }: FormTextareaProps) => (
  <div className="w-full">
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-success">{label}</label>
    <textarea
      id={id}
      rows={rows}
      className="block p-2.5 w-full text-sm bg-slate-100 rounded-lg border border-success focus:ring-primary-500 focus:border focus:border-success"
      placeholder={placeholder}
      required={required}
    ></textarea>
  </div>
);

const Contactus = () => {
  const categories = [
    { value: '', label: 'اختر سبب التواصل' },
    { value: 'TV', label: 'طلب عرض سعر' },
    { value: 'PC', label: 'ملاحضة' },
    { value: 'GA', label: 'شكوى' },
    { value: 'PH', label: 'مقترح' },
  ];

  return (
    <section className="bg-product bg-no-repeat bg-right-bottom md:py-6 xl:py-16">
      <div className="px-4 mx-auto max-w-2xl pb-20 lg:pb-32">
        <h2 className="mb-4 text-xl font-bold text-success pt-10 md:pt-0">تواصل معنا</h2>
        <form action="#">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <FormInput label="الأسم" type="text" id="name" placeholder="أدخل الاسم" required />
            <FormInput label="رقم الجوال" type="text" id="brand" placeholder="أدخل رقم الجوال" required />
            <FormInput label="البريد الإلكتروني" type="text" id="price" placeholder="أدخل البريد الإلكتروني" required />
            <FormInput label="اسم الشركة" type="number" id="item-weight" placeholder="اسم الشركة" required />
            <FormSelect label="سبب التواصل" id="category" options={categories} defaultValue="" />
            <div className="sm:col-span-2">
              <FormTextarea
                label="الوصف"
                id="description"
                placeholder="أدخل الوصف هنا"
                rows={8}
                required={true}
              />
            </div>
          </div>
          <button type="submit" className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-primary border border-primary bg-success rounded-lg focus:ring-4 focus:ring-primary">
            ارسال
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contactus;
