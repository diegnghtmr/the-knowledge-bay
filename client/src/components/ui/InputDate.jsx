import { DatePicker } from '@ark-ui/react'
import { Portal } from '@ark-ui/react/portal'
import React, {useState} from "react";
import {CalendarIcon, ChevronLeftIcon, ChevronRightIcon} from "lucide-react";


const InputDate = ({ id, label, value, onChange }) => {
    const [selectedDate, setSelectedDate] = useState(value || '');

    const handleDateChange = (details) => {
        // details.value contiene el array de fechas seleccionadas
        const dateValue = details.value[0]; // Tomamos la primera fecha del array
        setSelectedDate(dateValue);
        if (onChange) {
            // Crear un evento sintético para mantener consistencia con otros inputs
            const syntheticEvent = {
                target: {
                    id,
                    value: dateValue
                }
            };
            onChange(syntheticEvent);
        }
    };

    return (
        <DatePicker.Root className={"mt-6 w-full"}
                         closeOnSelect
                         positioning={{ placement: "right-start" }}
                         value={selectedDate ? [selectedDate] : []}
                         onValueChange={handleDateChange}
        >
            <DatePicker.Label className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1" htmlFor={id}>{label}</DatePicker.Label>
            <DatePicker.Control className="rounded-xl shadow-sm w-full pl-12 pt-2 pb-3">
                <DatePicker.Input className="w-[180px] mr-4 focus:outline-none"
                                  id={id}
                                  name={id}
                                  onChange={onChange} />

                <DatePicker.Trigger className="cursor-pointer">
                    <CalendarIcon className="relative top-[0.4rem] h-6 w-6 text-(--deep-sea)" />
                </DatePicker.Trigger>
            </DatePicker.Control>
            <Portal>
                <DatePicker.Positioner >
                    <DatePicker.Content className="bg-(--coastal-sea) rounded-xl shadow-lg p-4 w-full">
                        <DatePicker.View view="day" className="flex flex-col gap-2 w-full">
                            <DatePicker.Context>
                                {(datePicker) => (
                                    <>
                                        <DatePicker.ViewControl className="flex justify-between">
                                            <DatePicker.PrevTrigger className="cursor-pointer">
                                                <ChevronLeftIcon className="h-5 w-5 text-(--deep-sea) focus:text-white" />
                                            </DatePicker.PrevTrigger>
                                            <DatePicker.ViewTrigger className="cursor-pointer">
                                                <DatePicker.RangeText />
                                            </DatePicker.ViewTrigger>
                                            <DatePicker.NextTrigger className="cursor-pointer">
                                                <ChevronRightIcon className="h-5 w-5 text-(--deep-sea)" />
                                            </DatePicker.NextTrigger>
                                        </DatePicker.ViewControl>
                                        <DatePicker.Table  className="w-[250px]">
                                            <DatePicker.TableHead className="mb-2">
                                                <DatePicker.TableRow>
                                                    {datePicker.weekDays.map((weekDay, id) => (
                                                        <DatePicker.TableHeader key={id} className="mr-2">{weekDay.short}</DatePicker.TableHeader>
                                                    ))}
                                                </DatePicker.TableRow>
                                            </DatePicker.TableHead>
                                            <DatePicker.TableBody>
                                                {datePicker.weeks.map((week, id) => (
                                                    <DatePicker.TableRow key={id}>
                                                        {week.map((day, id) => (
                                                            <DatePicker.TableCell key={id} value={day} className={"ml-2"}>
                                                                <DatePicker.TableCellTrigger className="text-(--deep-sea) text-center">{day.day}</DatePicker.TableCellTrigger>
                                                            </DatePicker.TableCell>
                                                        ))}
                                                    </DatePicker.TableRow>
                                                ))}
                                            </DatePicker.TableBody>
                                        </DatePicker.Table>
                                    </>
                                )}
                            </DatePicker.Context>
                        </DatePicker.View>
                        <DatePicker.View view="month" className="flex flex-col gap-2 w-full">
                            <DatePicker.Context>
                                {(datePicker) => (
                                    <>
                                        <DatePicker.ViewControl className={"flex justify-between"}>
                                            <DatePicker.PrevTrigger>
                                                <ChevronLeftIcon className="h-5 w-5 text-(--deep-sea) focus:text-white" />
                                            </DatePicker.PrevTrigger>
                                            <DatePicker.ViewTrigger>
                                                <DatePicker.RangeText />
                                            </DatePicker.ViewTrigger>
                                            <DatePicker.NextTrigger>
                                                <ChevronRightIcon className="h-5 w-5 text-(--deep-sea) focus:text-white" />
                                            </DatePicker.NextTrigger>
                                        </DatePicker.ViewControl>
                                        <DatePicker.Table className="w-[250px]">
                                            <DatePicker.TableBody>
                                                {datePicker.getMonthsGrid({ columns: 4, format: 'short' }).map((months, id) => (
                                                    <DatePicker.TableRow key={id}>
                                                        {months.map((month, id) => (
                                                            <DatePicker.TableCell key={id} value={month.value}>
                                                                <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
                                                            </DatePicker.TableCell>
                                                        ))}
                                                    </DatePicker.TableRow>
                                                ))}
                                            </DatePicker.TableBody>
                                        </DatePicker.Table>
                                    </>
                                )}
                            </DatePicker.Context>
                        </DatePicker.View>
                        <DatePicker.View view="year" className="flex flex-col  gap-2 w-full">
                            <DatePicker.Context>
                                {(datePicker) => (
                                    <>
                                        <DatePicker.ViewControl className="flex justify-between">
                                            <DatePicker.PrevTrigger className="focus:bg-black">
                                                <ChevronLeftIcon className="h-5 w-5 text-(--deep-sea) focus:text-white" />
                                            </DatePicker.PrevTrigger>
                                            <DatePicker.ViewTrigger>
                                                <DatePicker.RangeText />
                                            </DatePicker.ViewTrigger>
                                            <DatePicker.NextTrigger>
                                                <ChevronRightIcon className="h-5 w-5 text-(--deep-sea) focus:text-white" />
                                            </DatePicker.NextTrigger>
                                        </DatePicker.ViewControl>
                                        <DatePicker.Table className="w-[230px]">
                                            <DatePicker.TableBody>
                                                {datePicker.getYearsGrid({ columns: 4 }).map((years, id) => (
                                                    <DatePicker.TableRow key={id}>
                                                        {years.map((year, id) => (
                                                            <DatePicker.TableCell key={id} value={year.value}>
                                                                <DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
                                                            </DatePicker.TableCell>
                                                        ))}
                                                    </DatePicker.TableRow>
                                                ))}
                                            </DatePicker.TableBody>
                                        </DatePicker.Table>
                                    </>
                                )}
                            </DatePicker.Context>
                        </DatePicker.View>
                    </DatePicker.Content>
                </DatePicker.Positioner>
            </Portal>
        </DatePicker.Root>
    )
}

export default InputDate